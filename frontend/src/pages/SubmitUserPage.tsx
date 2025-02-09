import React, { useState } from "react";
import { submitUser } from "../api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { User, Address } from "../types";

function SubmitUserPage() {
  const [formData, setFormData] = useState<User>({
    firstname: "",
    lastname: "",
    gender: "",
    persian_date: "", // Store the Persian date as a string
    addresses: [{ subject: "", details: "" }],
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await submitUser(formData);
      alert(`User submitted successfully! User ID: ${response.user_id}`);
    } catch (error) {
      alert("Failed to submit user. Please check the console for errors.");
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);

    // Format the Gregorian date as a Persian date
    const persianDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
    setFormData({ ...formData, persian_date: persianDate });
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
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="yyyy/MM/dd"
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
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
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default SubmitUserPage;
