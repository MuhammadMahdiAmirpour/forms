import React, { useState } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { submitUser } from "../api";
import { User, Address } from "../types";

function SubmitUserPage() {
  const [formData, setFormData] = useState<User>({
    firstname: "",
    lastname: "",
    gender: "",
    persian_date: "", // Will be stored as a string of digits, e.g. "14000101"
    addresses: [{ subject: "", details: "" }],
  });
  
  const [selectedDate, setSelectedDate] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await submitUser(formData);
      alert(`User submitted successfully! User ID: ${response.user_id}`);
    } catch (error) {
      alert("Failed to submit user. Please check the console for errors.");
    }
  };

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
    // Format the date as YYYYMMDD (e.g. "14000101") which converts to integer on backend
    const persianDateStr = date ? date.format("YYYYMMDD") : "";
    setFormData({ ...formData, persian_date: persianDateStr });
  };

  const handleAddressChange = (index: number, field: keyof Address, value: string) => {
    const updatedAddresses = [...formData.addresses];
    updatedAddresses[index][field] = value;
    setFormData({ ...formData, addresses: updatedAddresses });
  };

  return (
    <div>
      <h2>Submit User</h2>
      <form onSubmit={handleSubmit}>
        <label>
          First Name:
          <input
            type="text"
            value={formData.firstname}
            onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
            required
          />
        </label>
        <br />
        <label>
          Last Name:
          <input
            type="text"
            value={formData.lastname}
            onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
            required
          />
        </label>
        <br />
        <label>
          Gender:
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </label>
        <br />
        <label>
          Persian Date:
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            calendar={persian}
            locale={persian_fa}
            format="YYYY/MM/DD"
            calendarPosition="bottom-center"
          />
        </label>
        <br />
        <h3>Addresses</h3>
        {formData.addresses.map((address, index) => (
          <div key={index}>
            <label>
              Subject:
              <input
                type="text"
                value={address.subject}
                onChange={(e) => handleAddressChange(index, "subject", e.target.value)}
                required
              />
            </label>
            <label>
              Details:
              <input
                type="text"
                value={address.details}
                onChange={(e) => handleAddressChange(index, "details", e.target.value)}
                required
              />
            </label>
          </div>
        ))}
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default SubmitUserPage;
