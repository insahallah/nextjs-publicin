"use client";
import { useState } from "react";

// ==== PROPS TYPE ====
interface ContactDetailsFormProps {
  mobileNumber?: string;
  onContactSubmit: (data: {
    contactPersons: string[];
    mobileNumbers: string[];
    whatsappNumbers: string[];
  }) => void;
  onBack: () => void;
}

export default function ContactDetailsForm({
  mobileNumber = "",
  onContactSubmit,
  onBack,
}: ContactDetailsFormProps) {
  const [contactPersons, setContactPersons] = useState([{ value: "" }]);
  const [mobileNumbers, setMobileNumbers] = useState([{ value: mobileNumber }]);
  const [whatsappNumbers, setWhatsappNumbers] = useState([{ value: "" }]);

  const addField = (setList: any, list: any) => {
    if (list.length < 3) {
      setList([...list, { value: "" }]);
    }
  };

  const updateField = (
    setList: any,
    list: any,
    index: number,
    value: string
  ) => {
    const updated = [...list];
    updated[index].value = value;
    setList(updated);
  };

  const handleSubmit = () => {
    onContactSubmit({
      contactPersons: contactPersons.map((i) => i.value),
      mobileNumbers: mobileNumbers.map((i) => i.value),
      whatsappNumbers: whatsappNumbers.map((i) => i.value),
    });
  };

  return (
    <div className="container">
      <h2 className="title">Contact Details</h2>

      {/* Contact Person */}
      <div className="section">
        <div className="sectionTitle">Contact Persons</div>
        {contactPersons.map((item, index) => (
          <input
            key={index}
            value={item.value}
            onChange={(e) =>
              updateField(setContactPersons, contactPersons, index, e.target.value)
            }
            placeholder="Enter Contact Person"
            className="input"
          />
        ))}
        {contactPersons.length < 3 && (
          <button
            className="addButton"
            onClick={() => addField(setContactPersons, contactPersons)}
          >
            + Add Contact Person
          </button>
        )}
      </div>

      {/* Mobile Number */}
      <div className="section">
        <div className="sectionTitle">Mobile Numbers</div>
        {mobileNumbers.map((item, index) => (
          <input
            key={index}
            value={item.value}
            onChange={(e) =>
              updateField(setMobileNumbers, mobileNumbers, index, e.target.value)
            }
            placeholder="Enter Mobile Number"
            className="input"
          />
        ))}
        {mobileNumbers.length < 3 && (
          <button
            className="addButton"
            onClick={() => addField(setMobileNumbers, mobileNumbers)}
          >
            + Add Mobile Number
          </button>
        )}
      </div>

      {/* WhatsApp Number */}
      <div className="section">
        <div className="sectionTitle">WhatsApp Numbers</div>
        {whatsappNumbers.map((item, index) => (
          <input
            key={index}
            value={item.value}
            onChange={(e) =>
              updateField(
                setWhatsappNumbers,
                whatsappNumbers,
                index,
                e.target.value
              )
            }
            placeholder="Enter WhatsApp Number"
            className="input"
          />
        ))}
        {whatsappNumbers.length < 3 && (
          <button
            className="addButton"
            onClick={() => addField(setWhatsappNumbers, whatsappNumbers)}
          >
            + Add WhatsApp Number
          </button>
        )}
      </div>

      {/* Buttons */}
      <div className="buttonRow">
        <button className="backBtn" onClick={onBack}>
          Back
        </button>
        <button className="submitBtn" onClick={handleSubmit}>
          Save & Continue
        </button>
      </div>

      {/* ==== CSS HERE INSIDE SAME FILE ==== */}
      <style jsx>{`
        .container {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          padding: 20px;
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 15px;
        }

        .section {
          margin-bottom: 25px;
        }

        .sectionTitle {
          font-weight: 600;
          margin-bottom: 10px;
          font-size: 15px;
        }

        .input {
          width: 100%;
          padding: 10px;
          margin-bottom: 8px;
          font-size: 14px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }

        .addButton {
          padding: 8px 12px;
          font-size: 13px;
          background: #007bff;
          border: none;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        }

        .addButton:hover {
          background: #0069d9;
        }

        .buttonRow {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }

        .backBtn {
          padding: 10px 18px;
          background: #aaa;
          color: white;
          border-radius: 6px;
          border: none;
          cursor: pointer;
        }

        .backBtn:hover {
          background: #888;
        }

        .submitBtn {
          padding: 10px 18px;
          background: #28a745;
          color: white;
          border-radius: 6px;
          border: none;
          cursor: pointer;
        }

        .submitBtn:hover {
          background: #218838;
        }
      `}</style>
    </div>
  );
}
