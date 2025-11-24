'use client';

import { useState } from "react";

const daysList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface TimeSlot {
  days: string[];
  open: string;
  close: string;
}

interface BusinessTimingsProps {
  onTimingsSubmit: (timingsData: any) => void;
  onBack: () => void;
}

export default function BusinessTimings({ onTimingsSubmit, onBack }: BusinessTimingsProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { days: [], open: "", close: "" },
  ]);

  // 12-hour format time options from 08:30 AM to 07:00 PM
  const timeOptions = [
    "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", 
    "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", 
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", 
    "06:30 PM", "07:00 PM"
  ];

  const getDisabledDays = (slotIndex: number) => {
    const usedDays = new Set<string>();
    for (let i = 0; i < slotIndex; i++) {
      timeSlots[i].days.forEach((d) => usedDays.add(d));
    }
    return usedDays;
  };

  const toggleDay = (slotIndex: number, day: string) => {
    const updated = [...timeSlots];
    const slot = updated[slotIndex];

    if (slot.days.includes(day)) {
      slot.days = slot.days.filter((d) => d !== day);
    } else {
      slot.days.push(day);
    }

    if (slot.days.length === 0) {
      slot.open = "";
      slot.close = "";
    }

    setTimeSlots(updated);
  };

  const toggleSelectAll = (slotIndex: number) => {
    const updated = [...timeSlots];
    const slot = updated[slotIndex];

    const disabledDays = getDisabledDays(slotIndex);
    const selectableDays = daysList.filter((d) => !disabledDays.has(d));

    if (slot.days.length === selectableDays.length) {
      slot.days = [];
      slot.open = "";
      slot.close = "";
    } else {
      slot.days = selectableDays;
    }

    setTimeSlots(updated);
  };

  const updateTimeSlot = (slotIndex: number, field: "open" | "close", value: string) => {
    const updated = [...timeSlots];
    const slot = updated[slotIndex];

    if (field === "open") {
      slot.open = value;
      if (value === "24HRS" || value === "CLOSED") slot.close = "";
      if (slot.close && value !== "24HRS" && value !== "CLOSED") {
        const openIndex = timeOptions.indexOf(value);
        const closeIndex = timeOptions.indexOf(slot.close);
        if (closeIndex <= openIndex) slot.close = "";
      }
    } else {
      slot.close = value;
    }

    setTimeSlots(updated);
  };

  const addSlot = () => {
    if (timeSlots.length >= 7) return alert("You can add a maximum of 7 time slots.");
    setTimeSlots([...timeSlots, { days: [], open: "", close: "" }]);
  };

  const removeSlot = (index: number) => {
    if (timeSlots.length === 1) return alert("At least one slot is required.");
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  // Convert 12-hour format to database format (remove AM/PM and keep as-is)
  const convertToDatabaseFormat = (time12h: string): string => {
    if (!time12h || time12h === "24HRS" || time12h === "CLOSED") return "";
    
    // Simply remove the AM/PM part and return the time
    const [time] = time12h.split(' ');
    return time;
  };

  const handleSubmit = () => {
    // Prepare data for database insertion
    const timingsData: any[] = [];
    
    timeSlots.forEach(slot => {
      slot.days.forEach(day => {
        const dayLower = day.toLowerCase().substring(0, 3); // Convert to "mon", "tue", etc.
        
        if (slot.open === "CLOSED") {
          // For closed days, insert empty strings
          timingsData.push({
            days: dayLower,
            open_at: "",
            closed_at: ""
          });
        } else if (slot.open === "24HRS") {
          // For 24 hours, insert 00:00 to 23:59
          timingsData.push({
            days: dayLower,
            open_at: "00:00",
            closed_at: "23:59"
          });
        } else if (slot.open && slot.close) {
          // For regular hours, convert to database format (remove AM/PM)
          timingsData.push({
            days: dayLower,
            open_at: convertToDatabaseFormat(slot.open),
            closed_at: convertToDatabaseFormat(slot.close)
          });
        }
      });
    });

    console.log("Database Insertion Data:", timingsData);
    
    // Also prepare formatted data for display
    const businessHours: any = {};
    
    timeSlots.forEach(slot => {
      slot.days.forEach(day => {
        const dayLower = day.toLowerCase();
        if (slot.open === "CLOSED") {
          businessHours[dayLower] = { open: "", close: "", closed: true };
        } else if (slot.open === "24HRS") {
          businessHours[dayLower] = { open: "00:00", close: "23:59", closed: false };
        } else if (slot.open && slot.close) {
          businessHours[dayLower] = { 
            open: convertToDatabaseFormat(slot.open), 
            close: convertToDatabaseFormat(slot.close), 
            closed: false 
          };
        } else {
          businessHours[dayLower] = { open: "", close: "", closed: true };
        }
      });
    });

    // Fill in missing days with default closed
    daysList.forEach(day => {
      const dayLower = day.toLowerCase();
      if (!businessHours[dayLower]) {
        businessHours[dayLower] = { open: "", close: "", closed: true };
      }
    });

    console.log("Display Format:", businessHours);
    
    // Send both formats to parent
    onTimingsSubmit({
      databaseFormat: timingsData,
      displayFormat: businessHours
    });
  };

  // Hide Add Slot if all 7 days are used across all slots
  const allSelectedDays = new Set<string>();
  timeSlots.forEach(slot => slot.days.forEach(d => allSelectedDays.add(d)));
  const hideAddButton = allSelectedDays.size === 7;

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
          Set Your Business Timings
        </h1>
        <p className="text-sm text-gray-600">
          Configure your business hours for each day of the week
        </p>
      </div>

      {timeSlots.map((slot, index) => {
        const hideClose = slot.open === "24HRS" || slot.open === "CLOSED";
        const openIndex = slot.open ? timeOptions.indexOf(slot.open) : -1;
        const disabledDays = getDisabledDays(index);

        return (
          <div key={index} className="border p-4 mb-6 rounded-lg shadow-sm relative">
            {index > 0 && (
              <button
                onClick={() => removeSlot(index)}
                className="absolute right-2 top-2 text-red-600 text-sm hover:text-red-800"
              >
                ✕ Remove
              </button>
            )}

            <h3 className="text-lg font-semibold mb-4">Time Slot #{index + 1}</h3>

            {/* Days Selection */}
            <label className="block text-gray-800 font-medium mb-2">Select Days of the Week</label>
            <div className="flex flex-wrap gap-3 mb-4">
              {daysList.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(index, day)}
                  disabled={disabledDays.has(day)}
                  className={`px-4 py-1 rounded-full border text-sm transition-colors ${
                    slot.days.includes(day)
                      ? "bg-blue-600 text-white border-blue-600"
                      : disabledDays.has(day)
                      ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                      : "bg-white border-gray-400 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Select All */}
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={slot.days.length === daysList.filter(d => !disabledDays.has(d)).length && slot.days.length > 0}
                onChange={() => toggleSelectAll(index)}
                className="w-4 h-4"
              />
              <span className="font-medium text-blue-600">Select All Available Days</span>
            </label>

            {/* Open and Close Time */}
            <div className="flex flex-wrap gap-6 mb-4">
              <div className="w-44">
                <label className="block text-sm font-medium mb-1">Open at</label>
                <select
                  value={slot.open}
                  onChange={(e) => updateTimeSlot(index, "open", e.target.value)}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={slot.days.length === 0}
                >
                  <option value="">Select</option>
                  <option value="24HRS">Open 24 Hrs</option>
                  <option value="CLOSED">Closed</option>
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {!hideClose && (
                <div className="w-44">
                  <label className="block text-sm font-medium mb-1">Close at</label>
                  <select
                    value={slot.close}
                    onChange={(e) => updateTimeSlot(index, "close", e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    disabled={!slot.open || slot.days.length === 0}
                  >
                    <option value="">Select</option>
                    {timeOptions
                      .filter((t, i) => i > openIndex)
                      .map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            {/* Display database format preview */}
            {slot.days.length > 0 && slot.open && slot.open !== "24HRS" && slot.open !== "CLOSED" && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Will be stored in database as:</strong><br />
                  Days: {slot.days.join(", ")}<br />
                  Open: {convertToDatabaseFormat(slot.open)}<br />
                  Close: {slot.close ? convertToDatabaseFormat(slot.close) : "Not set"}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Add Another Time Slot */}
      {!hideAddButton && (
        <button 
          onClick={addSlot} 
          className="text-blue-600 font-medium mb-6 hover:text-blue-800 flex items-center gap-1"
        >
          + Add Another Time Slot
        </button>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Continue to Image Upload
        </button>
      </div>
    </div>
  );
}