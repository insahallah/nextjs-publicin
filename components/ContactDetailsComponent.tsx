"use client";
import { useState, useEffect } from "react";

interface ContactData {
  contactPersonName: string;
  contactEmail: string;
  alternateMobile: string;
  mobileNumbers: string[];
  whatsappNumbers: string[];
  emails: string[];
  contactPersons: string[];
  sameAsMobile: boolean;
}

interface ContactDetailsFormProps {
  mobileNumber?: string;
  onContactSubmit: (data: ContactData) => void;
  onBack: () => void;
}

export default function ContactDetailsForm({
  mobileNumber = "",
  onContactSubmit,
  onBack,
}: ContactDetailsFormProps) {
  const [contactPersons, setContactPersons] = useState<{ value: string }[]>([
    { value: "" },
  ]);
  const [mobileNumbers, setMobileNumbers] = useState<{ value: string }[]>([
    { value: "" },
  ]);
  const [whatsappNumbers, setWhatsappNumbers] = useState<
    { value: string }[]
  >([{ value: "" }]);
  const [emails, setEmails] = useState<{ value: string }[]>([{ value: "" }]);
  const [sameAsMobile, setSameAsMobile] = useState<boolean>(false);
  const [userData, setUserData] = useState<{ fullName?: string; name?: string } | null>(
    null
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const user = JSON.parse(storedUserData);
        setUserData(user);

        if (user.fullName || user.name) {
          setContactPersons([{ value: user.fullName || user.name }]);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (mobileNumber) {
      setMobileNumbers([{ value: mobileNumber }]);
      setSameAsMobile(true);
      setWhatsappNumbers([{ value: mobileNumber }]);
    }
  }, [mobileNumber]);

  const addField = (
    setter: React.Dispatch<React.SetStateAction<{ value: string }[]>>,
    list: { value: string }[]
  ) => {
    if (list.length >= 3) {
      alert("You can only add up to 3 fields");
      return;
    }
    setter([...list, { value: "" }]);
  };

  const updateField = (
    setter: React.Dispatch<React.SetStateAction<{ value: string }[]>>,
    list: { value: string }[],
    index: number,
    value: string
  ) => {
    const newList = [...list];
    newList[index].value = value;
    setter(newList);
  };

  const removeField = (
    setter: React.Dispatch<React.SetStateAction<{ value: string }[]>>,
    list: { value: string }[],
    index: number
  ) => {
    if (index === 0) return;
    const newList = [...list];
    newList.splice(index, 1);
    setter(newList);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const contactData: ContactData = {
      contactPersonName: contactPersons[0]?.value || "",
      contactEmail: emails[0]?.value || "",
      alternateMobile: mobileNumbers.length > 1 ? mobileNumbers[1]?.value : "",
      mobileNumbers: mobileNumbers.map((i) => i.value),
      whatsappNumbers: whatsappNumbers.map((i) => i.value),
      emails: emails.map((i) => i.value),
      contactPersons: contactPersons.map((i) => i.value),
      sameAsMobile: sameAsMobile,
    };

    onContactSubmit(contactData);
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto" }}>
      <style>{`
        .float-container {
          position: relative;
          width: 100%;
        }
        .float-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 6px;
          outline: none;
          font-size: 15px;
          transition: 0.2s;
        }
        .float-input:focus {
          border-color: #007bff;
        }
        .float-label {
          position: absolute;
          top: 12px;
          left: 12px;
          color: #777;
          pointer-events: none;
          transition: 0.2s;
          background: white;
          padding: 0 4px;
        }
        .float-input:focus + .float-label,
        .float-input:not(:placeholder-shown) + .float-label {
          top: -8px;
          font-size: 12px;
          color: #007bff;
        }
        .auto-filled {
          background-color: #f0f8ff;
          border-color: #007bff;
        }
      `}</style>

      <h2
        style={{ fontSize: 26, fontWeight: 700, marginBottom: 20 }}
      >
        Add Contact Details
      </h2>

      <form onSubmit={handleSubmit}>
        {/* ================= CONTACT PERSON ================= */}
        {contactPersons.map((item, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div className="float-container" style={{ flex: 1 }}>
                <input
                  type="text"
                  className="float-input"
                  placeholder=" "
                  value={item.value}
                  onChange={(e) =>
                    updateField(setContactPersons, contactPersons, i, e.target.value)
                  }
                  required
                />
                <label className="float-label">
                  Contact Person {i === 0 && "*"}
                </label>
              </div>

              {i > 0 && (
                <img
                  src="/remove.svg"
                  onClick={() =>
                    removeField(setContactPersons, contactPersons, i)
                  }
                  style={{ width: 18, height: 18, cursor: "pointer" }}
                  alt="Remove"
                />
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => addField(setContactPersons, contactPersons)}
          style={{
            border: "none",
            background: "none",
            color: "#007BFF",
            fontSize: 14,
            cursor: "pointer",
            marginBottom: 20,
          }}
        >
          + Add Another Contact Person
        </button>

        {/* ================= MOBILE NUMBERS ================= */}
        {mobileNumbers.map((item, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <div className="float-container" style={{ flex: 1 }}>
                <input
                  className="float-input"
                  placeholder=" "
                  value={item.value}
                  onChange={(e) => {
                    updateField(setMobileNumbers, mobileNumbers, i, e.target.value);
                    if (sameAsMobile && i === 0) {
                      setWhatsappNumbers([{ value: e.target.value }]);
                    }
                  }}
                  required
                />
                <label className="float-label">
                  Mobile Number {i === 0 && "*"}
                </label>
              </div>

              {i > 0 && (
                <img
                  src="/remove.svg"
                  onClick={() => removeField(setMobileNumbers, mobileNumbers, i)}
                  style={{ width: 18, height: 18, cursor: "pointer" }}
                  alt="Remove"
                />
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => addField(setMobileNumbers, mobileNumbers)}
          style={{
            border: "none",
            background: "none",
            color: "#007BFF",
            fontSize: 14,
            cursor: "pointer",
            marginBottom: 15,
          }}
        >
          + Add Another Mobile Number
        </button>

        {/* ================= SAME AS MOBILE CHECKBOX ================= */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={sameAsMobile}
            onChange={(e) => {
              const checked = e.target.checked;
              setSameAsMobile(checked);

              if (checked) {
                setWhatsappNumbers([{ value: mobileNumbers[0].value }]);
              } else {
                setWhatsappNumbers([{ value: "" }]);
              }
            }}
          />
          <span style={{ color: "#007BFF" }}>Same As Mobile Number</span>
        </div>

        {/* ================= WHATSAPP ================= */}
        {whatsappNumbers.map((item, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <div className="float-container" style={{ flex: 1 }}>
                <input
                  className="float-input"
                  placeholder=" "
                  value={item.value}
                  disabled={sameAsMobile}
                  onChange={(e) =>
                    updateField(
                      setWhatsappNumbers,
                      whatsappNumbers,
                      i,
                      e.target.value
                    )
                  }
                  required
                />
                <label className="float-label">
                  WhatsApp Number {i === 0 && "*"}
                </label>
              </div>

              {!sameAsMobile && i > 0 && (
                <img
                  src="/remove.svg"
                  onClick={() =>
                    removeField(setWhatsappNumbers, whatsappNumbers, i)
                  }
                  style={{ width: 18, height: 18, cursor: "pointer" }}
                  alt="Remove"
                />
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => addField(setWhatsappNumbers, whatsappNumbers)}
          disabled={sameAsMobile}
          style={{
            border: "none",
            background: "none",
            color: sameAsMobile ? "#aaa" : "#007BFF",
            fontSize: 14,
            cursor: sameAsMobile ? "not-allowed" : "pointer",
            marginBottom: 20,
          }}
        >
          + Add WhatsApp Number
        </button>

        {/* ================= EMAILS ================= */}
        {emails.map((item, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <div className="float-container" style={{ flex: 1 }}>
                <input
                  type="email"
                  className="float-input"
                  placeholder=" "
                  value={item.value}
                  onChange={(e) => updateField(setEmails, emails, i, e.target.value)}
                />
                <label className="float-label">
                  Email Address {i === 0 && "*"}
                </label>
              </div>

              {i > 0 && (
                <img
                  src="/remove.svg"
                  onClick={() => removeField(setEmails, emails, i)}
                  style={{ width: 18, height: 18, cursor: "pointer" }}
                  alt="Remove"
                />
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => addField(setEmails, emails)}
          style={{
            border: "none",
            background: "none",
            color: "#007BFF",
            fontSize: 14,
            cursor: "pointer",
            marginBottom: 25,
          }}
        >
          + Add Another Email
        </button>

        {/* ================= BUTTONS ================= */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 8,
              border: "1px solid #007BFF",
              color: "#007BFF",
              fontWeight: 600,
              background: "white",
              cursor: "pointer",
            }}
          >
            Back
          </button>

          <button
            type="submit"
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 8,
              border: "none",
              color: "#fff",
              fontWeight: 600,
              background: "linear-gradient(90deg, #007BFF, #0057FF)",
              cursor: "pointer",
            }}
          >
            Save and Continue
          </button>
        </div>
      </form>
    </div>
  );
}
