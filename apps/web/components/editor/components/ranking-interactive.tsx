"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconGripVertical,
  IconChevronUp,
  IconChevronDown,
} from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";

export interface RankingOption {
  id?: string;
  label: string;
  value: string;
}

interface RankingInteractiveProps {
  options: RankingOption[];
  value?: string[];
  onChange?: (rankedValues: string[]) => void;
  disabled?: boolean;
}

interface SortableItemProps {
  id: string;
  option: RankingOption;
  rank: number;
  total: number;
  onRankChange: (newRank: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disabled?: boolean;
}

function SortableItem({
  id,
  option,
  rank,
  total,
  onRankChange,
  onMoveUp,
  onMoveDown,
  disabled = false,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl border bg-card transition-all ${
        isDragging
          ? "border-primary shadow-lg ring-2 ring-primary/20 opacity-90 z-20"
          : "border-border/70 hover:border-border hover:shadow-xs"
      }`}
    >
      {/* Drag Handle (Method A) */}
      {!disabled && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted/80 transition-colors touch-none"
          title="Drag to reorder"
          aria-label="Drag to reorder"
        >
          <IconGripVertical className="size-4" />
        </div>
      )}

      {/* Rank Selector (Method B: Select rank 1..N with auto-shift) */}
      <div className="shrink-0">
        {disabled ? (
          <div className="size-7 rounded-lg bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground">
            {rank}
          </div>
        ) : (
          <Select
            value={String(rank)}
            onValueChange={(val) => onRankChange(Number(val))}
          >
            <SelectTrigger
              className="h-7 w-12 px-1.5 text-xs font-semibold rounded-lg bg-muted/60 border-border/60 hover:bg-muted focus:ring-1 focus:ring-primary"
              title={`Rank position: ${rank} of ${total}`}
            >
              <SelectValue>{rank}</SelectValue>
            </SelectTrigger>
            <SelectContent position="popper" className="min-w-[6rem] z-50">
              {Array.from({ length: total }, (_, i) => i + 1).map((pos) => (
                <SelectItem key={pos} value={String(pos)} className="text-xs">
                  Rank {pos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Option Label */}
      <span className="flex-1 text-xs sm:text-sm font-medium text-foreground select-none truncate">
        {option.label || option.value}
      </span>

      {/* Step Reorder Controls (Keyboard / Mobile helper) */}
      {!disabled && total > 1 && (
        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={rank === 1}
            onClick={onMoveUp}
            className="size-6 text-muted-foreground hover:text-foreground disabled:opacity-20"
            title="Move up"
          >
            <IconChevronUp className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={rank === total}
            onClick={onMoveDown}
            className="size-6 text-muted-foreground hover:text-foreground disabled:opacity-20"
            title="Move down"
          >
            <IconChevronDown className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function RankingInteractive({
  options,
  value,
  onChange,
  disabled = false,
}: RankingInteractiveProps) {
  // Ordered options state
  const [items, setItems] = React.useState<RankingOption[]>(() => {
    if (!options || options.length === 0) return [];
    if (Array.isArray(value) && value.length > 0) {
      const optionMap = new Map(options.map((o) => [o.value, o]));
      const ordered: RankingOption[] = [];
      for (const val of value) {
        const found = optionMap.get(val);
        if (found) {
          ordered.push(found);
          optionMap.delete(val);
        }
      }
      for (const remaining of optionMap.values()) {
        ordered.push(remaining);
      }
      return ordered;
    }
    return [...options];
  });

  // Keep items synced if external options change
  React.useEffect(() => {
    if (!options || options.length === 0) {
      setItems([]);
      return;
    }

    setItems((currentItems) => {
      const optionMap = new Map(options.map((o) => [o.value, o]));
      const updated: RankingOption[] = [];

      // Preserve current user-selected order if possible
      for (const curr of currentItems) {
        const matching = optionMap.get(curr.value);
        if (matching) {
          updated.push({ ...matching, label: matching.label });
          optionMap.delete(curr.value);
        }
      }

      // Add any newly added options
      for (const remaining of optionMap.values()) {
        updated.push(remaining);
      }

      return updated;
    });
  }, [options]);

  // Keep synced if external value changes from outside
  React.useEffect(() => {
    if (Array.isArray(value) && value.length > 0 && options.length > 0) {
      const optionMap = new Map(options.map((o) => [o.value, o]));
      const ordered: RankingOption[] = [];
      for (const val of value) {
        const found = optionMap.get(val);
        if (found) {
          ordered.push(found);
          optionMap.delete(val);
        }
      }
      for (const remaining of optionMap.values()) {
        ordered.push(remaining);
      }
      setItems(ordered);
    }
  }, [value, options]);

  // Emit updated values whenever items change
  const updateItems = React.useCallback(
    (newItems: RankingOption[]) => {
      setItems(newItems);
      onChange?.(newItems.map((item) => item.value));
    },
    [onChange]
  );

  // Setup sensors for drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle Drag & Drop reorder (Method A)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => (i.id || i.value) === active.id);
      const newIndex = items.findIndex((i) => (i.id || i.value) === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const next = arrayMove(items, oldIndex, newIndex);
        updateItems(next);
      }
    }
  };

  // Handle direct Rank Number selection (Method B)
  const handleRankChange = (fromIndex: number, toRank: number) => {
    const toIndex = Math.max(0, Math.min(items.length - 1, toRank - 1));
    if (fromIndex === toIndex) return;

    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    if (moved) {
      next.splice(toIndex, 0, moved);
      updateItems(next);
    }
  };

  // Move up by 1 step
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const next = arrayMove(items, index, index - 1);
    updateItems(next);
  };

  // Move down by 1 step
  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) return;
    const next = arrayMove(items, index, index + 1);
    updateItems(next);
  };

  if (!items || items.length === 0) {
    return (
      <div className="p-3 text-xs text-muted-foreground border border-dashed rounded-lg text-center">
        No ranking options available.
      </div>
    );
  }

  const itemIds = items.map((i) => i.id || i.value);

  return (
    <div className="space-y-2 w-full max-w-md">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={itemIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((opt, index) => {
              const itemId = opt.id || opt.value;
              return (
                <SortableItem
                  key={itemId}
                  id={itemId}
                  option={opt}
                  rank={index + 1}
                  total={items.length}
                  onRankChange={(newRank) => handleRankChange(index, newRank)}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                  disabled={disabled}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 pt-1">
        <span>Drag items or change rank numbers to order</span>
        <span>{items.length} items</span>
      </div>
    </div>
  );
}

