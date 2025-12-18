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
  const [errors, setErrors] = useState<string[]>([]);

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
    // Clear errors when user interacts
    if (errors.length > 0) {
      setErrors([]);
    }
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
    // Clear errors when user interacts
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const updateTimeSlot = (slotIndex: number, field: "open" | "close", value: string) => {
    const updated = [...timeSlots];
    const slot = updated[slotIndex];

    if (field === "open") {
      slot.open = value;
      
      // Reset close time for special values
      if (value === "24HRS" || value === "CLOSED") {
        slot.close = "";
        
        // Automatically select all available days if none selected
        const disabledDays = getDisabledDays(slotIndex);
        const availableDays = daysList.filter(d => !disabledDays.has(d));
        
        // Only auto-select if no days are selected AND there are available days
        if (slot.days.length === 0 && availableDays.length > 0) {
          slot.days = availableDays;
        }
      }
      // If close time exists and new open time is after close time, reset close time
      else if (slot.close) {
        const openIndex = timeOptions.indexOf(value);
        const closeIndex = timeOptions.indexOf(slot.close);
        if (closeIndex <= openIndex) {
          slot.close = "";
        }
      }
    } else {
      // Just update close time
      slot.close = value;
    }

    setTimeSlots(updated);
    // Clear errors when user interacts
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const addSlot = () => {
    if (timeSlots.length >= 7) return alert("You can add a maximum of 7 time slots.");
    setTimeSlots([...timeSlots, { days: [], open: "", close: "" }]);
    // Clear errors when user interacts
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const removeSlot = (index: number) => {
    if (timeSlots.length === 1) return alert("At least one slot is required.");
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
    // Clear errors when user interacts
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // Convert 12-hour format to 24-hour database format
  const convertToDatabaseFormat = (time12h: string): string => {
    if (!time12h || time12h === "24HRS" || time12h === "CLOSED") return "";
    
    const [time, period] = time12h.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    if (period === "AM") {
      // Handle 12 AM (midnight)
      if (hours === 12) {
        return `00:${minutes.toString().padStart(2, '0')}`;
      }
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else if (period === "PM") {
      // Handle 12 PM (noon)
      if (hours === 12) {
        return `12:${minutes.toString().padStart(2, '0')}`;
      }
      return `${(hours + 12).toString()}:${minutes.toString().padStart(2, '0')}`;
    }
    
    return time;
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    // Check if at least one slot has days selected
    const hasAnyDaysSelected = timeSlots.some(slot => slot.days.length > 0);
    
    if (!hasAnyDaysSelected) {
      newErrors.push("Please select at least one day for your business hours");
      setErrors(newErrors);
      return false;
    }

    // Validate each slot that has days selected
    timeSlots.forEach((slot, index) => {
      if (slot.days.length > 0) {
        // If days are selected, open time must be selected
        if (!slot.open) {
          newErrors.push(`Time Slot #${index + 1}: Please select opening time for selected days`);
        } 
        // If open time is not special value, close time must be selected
        else if (slot.open !== "24HRS" && slot.open !== "CLOSED" && !slot.close) {
          newErrors.push(`Time Slot #${index + 1}: Please select closing time for selected days`);
        }
        // Additional validation for regular hours (not 24HRS or CLOSED)
        else if (slot.open !== "24HRS" && slot.open !== "CLOSED") {
          // Check if open time is valid
          if (!timeOptions.includes(slot.open)) {
            newErrors.push(`Time Slot #${index + 1}: Invalid opening time selected`);
          }
          // Check if close time is valid
          if (!slot.close || !timeOptions.includes(slot.close)) {
            newErrors.push(`Time Slot #${index + 1}: Please select a valid closing time`);
          }
          // Check if close time is after open time
          else if (timeOptions.indexOf(slot.close) <= timeOptions.indexOf(slot.open)) {
            newErrors.push(`Time Slot #${index + 1}: Closing time must be after opening time`);
          }
        }
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    console.log("Form submitted, validating...");
    console.log("Current timeSlots:", timeSlots);
    
    // First validate the form
    if (!validateForm()) {
      console.log("Validation failed with errors:", errors);
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    console.log("Validation passed, preparing data...");
    
    // Prepare data for database insertion
    const timingsData: any[] = [];
    
    timeSlots.forEach(slot => {
      if (slot.days.length === 0) return;
      
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
          // For 24 hours, insert 24:00 in BOTH fields
          timingsData.push({
            days: dayLower,
            open_at: "24:00",  // Changed from "00:00" to "24:00"
            closed_at: "24:00"
          });
        } else if (slot.open && slot.close) {
          // For regular hours, convert to database format
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
          // For display, also use 24:00 for both fields
          businessHours[dayLower] = { open: "24:00", close: "24:00", closed: false, is24Hrs: true };
        } else if (slot.open && slot.close) {
          businessHours[dayLower] = { 
            open: convertToDatabaseFormat(slot.open), 
            close: convertToDatabaseFormat(slot.close), 
            closed: false 
          };
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

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-pulse">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3 className="font-bold text-red-800">Please fix the following errors:</h3>
          </div>
          <ul className="list-disc pl-5">
            {errors.map((error, index) => (
              <li key={index} className="text-red-700 mb-1">{error}</li>
            ))}
          </ul>
        </div>
      )}

      {timeSlots.map((slot, index) => {
        const hideClose = slot.open === "24HRS" || slot.open === "CLOSED";
        const openIndex = slot.open ? timeOptions.indexOf(slot.open) : -1;
        const disabledDays = getDisabledDays(index);
        
        // Check if this slot has any validation errors
        const slotErrors = errors.filter(error => 
          error.includes(`Time Slot #${index + 1}`)
        );
        const hasSlotError = slotErrors.length > 0;

        return (
          <div 
            key={index} 
            className={`border p-4 mb-6 rounded-lg shadow-sm relative ${
              hasSlotError ? 'border-red-300 bg-red-50' : ''
            }`}
          >
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeSlot(index)}
                className="absolute right-2 top-2 text-red-600 text-sm hover:text-red-800"
              >
                ✕ Remove
              </button>
            )}

            <h3 className="text-lg font-semibold mb-4">Time Slot #{index + 1}</h3>

            {/* Show slot-specific errors */}
            {hasSlotError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
                <p className="text-sm text-red-700 font-medium">Issues with this slot:</p>
                <ul className="list-disc pl-5 mt-1">
                  {slotErrors.map((error, i) => (
                    <li key={i} className="text-xs text-red-600">{error.replace(`Time Slot #${index + 1}: `, '')}</li>
                  ))}
                </ul>
              </div>
            )}

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
                      : hasSlotError && slot.days.length === 0
                      ? "border-red-300 bg-white text-gray-700 hover:bg-gray-50"
                      : "bg-white border-gray-400 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Days selected count */}
            <div className="text-sm text-gray-600 mb-4">
              Selected: {slot.days.length} day{slot.days.length !== 1 ? 's' : ''}
              {slot.days.length === 0 && hasSlotError && (
                <span className="text-red-600 ml-2">← Please select at least one day</span>
              )}
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
                  className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                    hasSlotError && !slot.open && slot.days.length > 0 ? 'border-red-500' : ''
                  }`}
                  disabled={slot.days.length === 0}
                >
                  <option value="">Select</option>
                  <option value="24HRS">Open 24 Hrs</option>
                  <option value="CLOSED">Closed</option>
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {hasSlotError && !slot.open && slot.days.length > 0 && (
                  <p className="text-xs text-red-600 mt-1">Please select an opening time</p>
                )}
              </div>

              {!hideClose && (
                <div className="w-44">
                  <label className="block text-sm font-medium mb-1">Close at</label>
                  <select
                    value={slot.close}
                    onChange={(e) => updateTimeSlot(index, "close", e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      hasSlotError && !slot.close && slot.open && slot.open !== "24HRS" && slot.open !== "CLOSED" ? 'border-red-500' : ''
                    }`}
                    disabled={!slot.open || slot.days.length === 0}
                  >
                    <option value="">Select</option>
                    {timeOptions
                      .filter((t, i) => i > openIndex)
                      .map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                  </select>
                  {hasSlotError && !slot.close && slot.open && slot.open !== "24HRS" && slot.open !== "CLOSED" && (
                    <p className="text-xs text-red-600 mt-1">Please select a closing time</p>
                  )}
                </div>
              )}
            </div>

            {/* Current selection info */}
            {slot.days.length > 0 && slot.open && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>Current Selection:</strong><br />
                  Days: {slot.days.join(", ")}<br />
                  {slot.open === "24HRS" ? (
                    <>
                      <span className="text-green-600 font-medium">24 Hours Operation</span><br />
                      <span className="text-xs text-gray-600">
                        Will be stored as: <strong>24:00 - 24:00</strong> (Both fields will contain 24:00)
                      </span>
                    </>
                  ) : slot.open === "CLOSED" ? (
                    <>
                      <span className="text-red-600 font-medium">Closed</span><br />
                      <span className="text-xs text-gray-600">
                        Will be stored as: <strong>Empty - Empty</strong>
                      </span>
                    </>
                  ) : (
                    <>
                      Hours: {slot.open} - {slot.close || "Not selected yet"}<br />
                      <span className="text-xs text-gray-600">
                        Will be stored as: {convertToDatabaseFormat(slot.open)} - {slot.close ? convertToDatabaseFormat(slot.close) : "??:??"}
                      </span>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Add Another Time Slot */}
      {!hideAddButton && (
        <button 
          type="button"
          onClick={addSlot} 
          className="text-blue-600 font-medium mb-6 hover:text-blue-800 flex items-center gap-1"
        >
          + Add Another Time Slot
        </button>
      )}

      {/* Important Information */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-medium text-green-800 mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Database Storage Information
        </h3>
        <ul className="text-sm text-green-700 list-disc pl-5">
          <li><strong>24 Hours Operation:</strong> Will store <code className="bg-green-100 px-1 rounded">24:00</code> in BOTH <code>open_at</code> and <code>closed_at</code> fields</li>
          <li><strong>Closed Days:</strong> Will store empty strings in both fields</li>
          <li><strong>Regular Hours:</strong> Will convert to 24-hour format (e.g., 02:00 PM → 14:00)</li>
          <li>Each day will have its own database record</li>
        </ul>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Continue to Image Upload
        </button>
      </div>
    </div>
  );
}