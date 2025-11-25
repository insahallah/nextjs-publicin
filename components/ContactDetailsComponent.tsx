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

export default function ContactDetailsForm(props: ContactDetailsFormProps) {
  const { mobileNumber = "", onContactSubmit, onBack } = props;

  const [contactPersons, setContactPersons] = useState<{ value: string }[]>([
    { value: "" },
  ]);
  const [mobileNumbers, setMobileNumbers] = useState<{ value: string }[]>([
    { value: "" },
  ]);
  const [whatsappNumbers, setWhatsappNumbers] = useState<{ value: string }[]>([
    { value: "" },
  ]);
  const [emails, setEmails] = useState<{ value: string }[]>([{ value: "" }]);
  const [sameAsMobile, setSameAsMobile] = useState<boolean>(false);
  const [userData, setUserData] = useState<{
    fullName?: string;
    name?: string;
  } | null>(null);

  // ============= GET USER DATA FROM LOCALSTORAGE =============
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const user = JSON.parse(storedUserData);
        setUserData(user);

        // Auto-fill contact person with user's name
        if (user.fullName || user.name) {
          setContactPersons([{ value: user.fullName || user.name }]);
        }
      }
    }
  }, []);

  // ============= AUTO-FILL MOBILE NUMBER =============
  useEffect(() => {
    if (mobileNumber) {
      // Auto-fill first mobile number field
      setMobileNumbers([{ value: mobileNumber }]);

      // Auto-check "Same as Mobile" and fill WhatsApp
      setSameAsMobile(true);
      setWhatsappNumbers([{ value: mobileNumber }]);
    }
  }, [mobileNumber]);

  // ============= LIMIT 3 PER SECTION =============
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

  // ============= HANDLE FORM SUBMISSION =============
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Extract ALL contact data (sab fields include karein)
    const contactData: ContactData = {
      // Basic contact info
      contactPersonName: contactPersons[0]?.value || "",
      contactEmail: emails[0]?.value || "",
      alternateMobile:
        mobileNumbers.length > 1 ? mobileNumbers[1]?.value : "",

      // Additional details for complete data
      mobileNumbers: mobileNumbers.map((item) => item.value),
      whatsappNumbers: whatsappNumbers.map((item) => item.value),
      emails: emails.map((item) => item.value),
      contactPersons: contactPersons.map((item) => item.value),
      sameAsMobile: sameAsMobile,
    };

    console.log("Contact Data to Submit:", contactData); // Debugging ke liye

    // Call parent component's submit handler with complete data
    onContactSubmit(contactData);
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto" }}>
      {/* ================= CSS FOR FLOAT INPUT ================= */}
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
        .auto-filled:focus {
          background-color: #fff;
          border-color: #007bff;
        }
      `}</style>

      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 20 }}>
        Add Contact Details
      </h2>

      {/* Auto-fill Notifications */}
      <div style={{ marginBottom: 20 }}>
        {userData && (userData.fullName || userData.name) && (
          <div
            style={{
              backgroundColor: "#f0f8ff",
              border: "1px solid #007bff",
              borderRadius: "6px",
              padding: "10px 12px",
              marginBottom: "10px",
              fontSize: "14px",
              color: "#007bff",
            }}
          >
            ✅ Contact Person auto-filled from your profile
          </div>
        )}

        {mobileNumber && (
          <div
            style={{
              backgroundColor: "#f0f8ff",
              border: "1px solid #007bff",
              borderRadius: "6px",
              padding: "10px 12px",
              fontSize: "14px",
              color: "#007bff",
            }}
          >
            ✅ Mobile number auto-filled from your profile
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* ================= CONTACT PERSON ================= */}
        {contactPersons.map((item, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div className="float-container" style={{ flex: 1 }}>
                <input
                  type="text"
                  className={`float-input ${
                    i === 0 && userData && (userData.fullName || userData.name)
                      ? "auto-filled"
                      : ""
                  }`}
                  placeholder=" "
                  value={item.value}
                  onChange={(e) =>
                    updateField(
                      setContactPersons,
                      contactPersons,
                      i,
                      e.target.value
                    )
                  }
                  required
                />
                <label className="float-label">
                  Contact Person *
                  {i === 0 &&
                    userData &&
                    (userData.fullName || userData.name) &&
                    " (Auto-filled)"}
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

            {/* Helper text for contact person */}
            {i === 0 && userData && (userData.fullName || userData.name) && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#007bff",
                  marginTop: "4px",
                  fontStyle: "italic",
                }}
              >
                You can change this name if needed
              </div>
            )}
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
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div
                style={{
                  minWidth: 90,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <img
                  src="/india_flag.svg"
                  style={{ width: 18 }}
                  alt="India Flag"
                />
                <span>+91</span>
              </div>

              <div className="float-container" style={{ flex: 1 }}>
                <input
                  className={`float-input ${
                    i === 0 && mobileNumber ? "auto-filled" : ""
                  }`}
                  placeholder=" "
                  value={item.value}
                  onChange={(e) => {
                    updateField(
                      setMobileNumbers,
                      mobileNumbers,
                      i,
                      e.target.value
                    );
                    if (sameAsMobile && i === 0) {
                      setWhatsappNumbers([{ value: e.target.value }]);
                    }
                  }}
                  required
                />
                <label className="float-label">
                  Mobile Number {i === 0 ? "*" : ""}
                  {i === 0 && mobileNumber && " (Auto-filled)"}
                </label>
              </div>

              {i > 0 && (
                <img
                  src="/remove.svg"
                  onClick={() =>
                    removeField(setMobileNumbers, mobileNumbers, i)
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: -5,
            marginBottom: 20,
          }}
        >
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

        {/* ================= WHATSAPP NUMBERS ================= */}
        {whatsappNumbers.map((item, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div
                style={{
                  minWidth: 90,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <img
                  src="/whatsapp.svg"
                  style={{ width: 18 }}
                  alt="WhatsApp"
                />
                <span>+91</span>
              </div>

              <div className="float-container" style={{ flex: 1 }}>
                <input
                  className={`float-input ${
                    i === 0 && sameAsMobile ? "auto-filled" : ""
                  }`}
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
                  WhatsApp Number *
                  {sameAsMobile && " (Auto-filled from mobile)"}
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

            {/* Helper text for WhatsApp */}
            {sameAsMobile && i === 0 && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#007bff",
                  marginTop: "4px",
                  fontStyle: "italic",
                }}
              >
                Uncheck "Same as Mobile" to edit WhatsApp number separately
              </div>
            )}
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
            marginBottom: 25,
          }}
        >
          + Add WhatsApp Number
        </button>

        {/* ================= EMAIL ================= */}
        {emails.map((item, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div className="float-container" style={{ flex: 1 }}>
                <input
                  type="email"
                  className="float-input"
                  placeholder=" "
                  value={item.value}
                  onChange={(e) =>
                    updateField(setEmails, emails, i, e.target.value)
                  }
                />
                <label className="float-label">
                  Email Address {i === 0 ? "*" : ""}
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
            marginBottom: 30,
          }}
        >
          + Add Another Email
        </button>

        {/* ================= NAVIGATION BUTTONS ================= */}
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