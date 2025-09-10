import React from "react";

const FormatDate = ({ dateString }) => {
  
  if (!dateString || typeof dateString !== "string") {
    return <span>-</span>;
  }

  let formatted;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      formatted = "-";
    } else {
      formatted = date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Bangkok", // ระบุ Time Zone ชัดเจน
      });
    }
  } catch {
    formatted = "-";
  }
  const date = new Date(dateString);
  console.log("Raw Date:", date);
  console.log("Formatted:", formatted);
  return <span>{formatted}</span>;
};

const FormatDateTime = ({ dateString }) => {
  if (!dateString || typeof dateString !== "string") {
    return <span>-</span>;
  }

  let formatted;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      formatted = "-";
    } else {
      formatted = date.toLocaleString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Bangkok", // ระบุ Time Zone ชัดเจน
      });
    }
  } catch {
    formatted = "-";
  }
  const date = new Date(dateString);
  console.log("Raw Date:", date);
  console.log("Formatted:", formatted);
  return <span>{formatted}</span>;
};

const FormatTime = ({ dateString }) => {
  if (!dateString || typeof dateString !== "string") {
    return <span>-</span>;
  }

  let formatted;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      formatted = "-";
    } else {
      formatted = date.toLocaleString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Bangkok", // ระบุ Time Zone ชัดเจน
      });
    }
  } catch {
    formatted = "-";
  }
  const date = new Date(dateString);
  console.log("Raw Date:", date);
  console.log("Formatted:", formatted);
  return <span>{formatted}</span>;
};

export { FormatDate, FormatDateTime, FormatTime };