/**
 * Escapes a cell value for safe RFC 4180 CSV export.
 */
function escapeCsvValue(val: unknown): string {
  if (val === undefined || val === null) {
    return '""';
  }
  let str = String(val);
  // If string contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  } else {
    str = `"${str}"`;
  }
  return str;
}

export function downloadCsvFile(
  filename: string,
  columns: string[],
  rows: Array<Record<string, any>>
) {
  // 1. Build CSV header row
  const headerRow = columns.map(escapeCsvValue).join(",");

  // 2. Build rows
  const dataRows = rows.map((row) => {
    return columns
      .map((col) => {
        let val: any = undefined;
        if (col === "Submission ID") val = row.submissionId;
        else if (col === "Form Title") val = row.formTitle;
        else if (col === "Started At") val = row.startedAt ? new Date(row.startedAt).toISOString() : "";
        else if (col === "Submitted At") val = row.submittedAt ? new Date(row.submittedAt).toISOString() : "";
        else if (col === "Duration (s)") val = row.durationSeconds ?? "";
        else if (col === "Device") val = row.deviceType ?? "";
        else if (col === "Browser") val = row.browser ?? "";
        else if (col === "OS") val = row.os ?? "";
        else if (col === "Country") val = row.country ?? "";
        else if (row.answers && row.answers[col] !== undefined) {
          val = row.answers[col];
        }

        return escapeCsvValue(val);
      })
      .join(",");
  });

  const csvContent = [headerRow, ...dataRows].join("\r\n");

  // 3. Trigger browser download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

