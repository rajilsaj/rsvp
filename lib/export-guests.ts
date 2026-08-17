import type { Guest } from "@/lib/google-sheets";

export type GuestStats = {
  total: number;
  confirmed: number;
  declined: number;
  finalGuests: number;
};

function attendingLabel(g: Guest) {
  if (g.attending === "yes") return "Confirmed";
  if (g.attending === "no") return "Declined";
  return "Pending";
}

function seatingLabel(g: Guest) {
  return g.table ? `${g.table} / ${g.seats}` : "";
}

function sortedGuests(guests: Guest[]) {
  return [...guests].sort((a, b) => a.names.localeCompare(b.names));
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function summaryLine(stats: GuestStats) {
  return `Total: ${stats.total}   Confirmed: ${stats.confirmed}   Declined: ${stats.declined}   Final headcount (incl. +ones): ${stats.finalGuests}`;
}

export async function exportGuestsPdf(guests: Guest[], stats: GuestStats) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: "landscape", unit: "pt" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Wedding Guest List", 40, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated on ${todayStamp()}`, 40, 66);
  doc.setTextColor(60);
  doc.text(summaryLine(stats), 40, 84);

  autoTable(doc, {
    startY: 100,
    head: [["#", "Name(s)", "Phone", "Email", "RSVP", "+Ones", "Seating (table / seats)"]],
    body: sortedGuests(guests).map((g, i) => [
      String(i + 1),
      g.names,
      g.phone || "—",
      g.email || "—",
      attendingLabel(g),
      g.attending === "yes" ? String(g.plusOnes || 0) : "—",
      seatingLabel(g) || "—",
    ]),
    styles: { fontSize: 9, cellPadding: 6, textColor: 40 },
    headStyles: { fillColor: [136, 108, 84], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 245, 241] },
    columnStyles: {
      0: { cellWidth: 30, halign: "center" },
      4: { cellWidth: 70, halign: "center" },
      5: { cellWidth: 50, halign: "center" },
      6: { cellWidth: 120 },
    },
    didDrawPage: () => {
      const pageSize = doc.internal.pageSize;
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${doc.getNumberOfPages()}`,
        pageSize.getWidth() - 60,
        pageSize.getHeight() - 20,
      );
    },
  });

  doc.save(`guest-list-${todayStamp()}.pdf`);
}

export async function exportGuestsExcel(guests: Guest[], stats: GuestStats) {
  const { default: ExcelJS } = await import("exceljs");

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Guests", {
    views: [{ state: "frozen", ySplit: 5 }],
  });

  ws.columns = [
    { key: "n", width: 5 },
    { key: "names", width: 32 },
    { key: "phone", width: 18 },
    { key: "email", width: 30 },
    { key: "rsvp", width: 12 },
    { key: "plusOnes", width: 8 },
    { key: "seating", width: 20 },
  ];

  ws.mergeCells("A1:G1");
  const title = ws.getCell("A1");
  title.value = "Wedding Guest List";
  title.font = { bold: true, size: 16 };

  ws.mergeCells("A2:G2");
  const generated = ws.getCell("A2");
  generated.value = `Generated on ${todayStamp()}`;
  generated.font = { size: 10, color: { argb: "FF808080" } };

  ws.mergeCells("A3:G3");
  const summary = ws.getCell("A3");
  summary.value = summaryLine(stats);
  summary.font = { size: 10, italic: true };

  const headerRow = ws.getRow(5);
  headerRow.values = ["#", "Name(s)", "Phone", "Email", "RSVP", "+Ones", "Seating (table / seats)"];
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF886C54" } };
    cell.border = { bottom: { style: "thin" } };
  });

  sortedGuests(guests).forEach((g, i) => {
    const row = ws.addRow([
      i + 1,
      g.names,
      g.phone,
      g.email,
      attendingLabel(g),
      g.attending === "yes" ? g.plusOnes || 0 : "",
      seatingLabel(g),
    ]);
    if (i % 2 === 1) {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8F5F1" } };
      });
    }
  });

  ws.autoFilter = { from: "A5", to: "G5" };

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `guest-list-${todayStamp()}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
