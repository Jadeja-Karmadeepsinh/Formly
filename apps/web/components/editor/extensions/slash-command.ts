import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { Instance as TippyInstance } from "tippy.js";
import {
  getSlashMenuItems,
  SlashCommandMenu,
  type SlashMenuItem,
  type InsertFormFieldCallback,
} from "../components/slash-command-menu";

export interface SlashCommandOptions {
  onInsertFormField?: InsertFormFieldCallback;
}

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    return {
      onInsertFormField: () => {},
    };
  },

  addProseMirrorPlugins() {
    const items = getSlashMenuItems(this.options.onInsertFormField);

    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        command: ({ editor, range, props }) => {
          (props as SlashMenuItem).command(editor, range);
        },
        items: ({ query }) => {
          if (!query) return items;
          const q = query.toLowerCase();
          return items.filter(
            (item) =>
              item.title.toLowerCase().includes(q) ||
              item.description.toLowerCase().includes(q) ||
              (item.keywords &&
                item.keywords.some((k) => k.toLowerCase().includes(q)))
          );
        },
        render: () => {
          let component: InstanceType<typeof ReactRenderer> | null = null;
          let popup: TippyInstance[] | null = null;
          let selectedIndex = 0;

          return {
            onStart: (props) => {
              selectedIndex = 0;
              component = new ReactRenderer(SlashCommandMenu, {
                props: {
                  items: props.items as SlashMenuItem[],
                  command: (item: SlashMenuItem) => props.command(item),
                  selectedIndex: 0,
                },
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },

            onUpdate: (props) => {
              selectedIndex = 0;
              if (component) {
                component.updateProps({
                  items: props.items as SlashMenuItem[],
                  command: (item: SlashMenuItem) => props.command(item),
                  selectedIndex,
                });
              }

              if (!props.clientRect) {
                return;
              }

              popup?.[0]?.setProps({
                getReferenceClientRect: props.clientRect as () => DOMRect,
              });
            },

            onKeyDown: (props) => {
              if (props.event.key === "Escape") {
                popup?.[0]?.hide();
                return true;
              }

              const currentProps = component?.props as
                | { items?: SlashMenuItem[] }
                | undefined;
              const itemsCount = currentProps?.items?.length ?? 0;
              if (itemsCount === 0) return false;

              if (props.event.key === "ArrowUp") {
                selectedIndex =
                  (selectedIndex + itemsCount - 1) % itemsCount;
                if (component) {
                  component.updateProps({ selectedIndex });
                }
                return true;
              }

              if (props.event.key === "ArrowDown") {
                selectedIndex = (selectedIndex + 1) % itemsCount;
                if (component) {
                  component.updateProps({ selectedIndex });
                }
                return true;
              }

              if (props.event.key === "Enter") {
                const currentItems = currentProps?.items;
                const selectedItem = currentItems?.[selectedIndex];
                if (selectedItem) {
                  const commandFn =
                    (component?.props as any)?.command ||
                    (props as any)?.command;
                  if (typeof commandFn === "function") {
                    commandFn(selectedItem);
                    return true;
                  }
                }
              }

              return false;
            },

            onExit: () => {
              popup?.[0]?.destroy();
              component?.destroy();
            },
          };
        },
      }),
    ];
  },
});
