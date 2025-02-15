import React, { useState } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { submitUser } from "../api";
import { User, Address } from "../types";
import styles from "../styles/SubmitUserPage.module.css";

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
          alert(`User submitted successfully! User ID: ${response.id}`);
          // Clear form after successful submission
          setFormData({
              firstname: "",
              lastname: "",
              gender: "",
              persian_date: "",
              addresses: [{ subject: "", details: "" }],
          });
          setSelectedDate(null);
      } catch (error) {
          console.error('Submission error: ', error)
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

  const addAddress = () => {
    setFormData({
      ...formData,
      addresses: [...formData.addresses, { subject: "", details: "" }]
    });
  };

  const removeAddress = (index: number) => {
    const updatedAddresses = formData.addresses.filter((_, i) => i !== index);
    setFormData({ ...formData, addresses: updatedAddresses });
  };

  return (
    <div className={styles.container}>
      <h2>Submit User</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          First Name:
          <input
            type="text"
            value={formData.firstname}
            onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
            required
            className={styles.input}
          />
        </label>
        <br />
        <label className={styles.label}>
          Last Name:
          <input
            type="text"
            value={formData.lastname}
            onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
            required
            className={styles.input}
          />
        </label>
        <br />
        <label className={styles.label}>
          Gender:
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            required
            className={styles.select}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </label>
        <br />
        <label className={styles.label}>
          Persian Date:
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            calendar={persian}
            locale={persian_fa}
            format="YYYY/MM/DD"
            calendarPosition="bottom-center"
            className={styles.datePicker}
          />
        </label>
        <br />
        <h3>Addresses</h3>
        {formData.addresses.map((address, index) => (
          <div key={index} className={styles.addressRow}>
            <label className={styles.gridLabel}>Subject:</label>
            <input
              type="text"
              value={address.subject}
              onChange={(e) => handleAddressChange(index, "subject", e.target.value)}
              required
              className={styles.gridInput}
            />
            <label className={styles.gridLabel}>Details:</label>
            <input
              type="text"
              value={address.details}
              onChange={(e) => handleAddressChange(index, "details", e.target.value)}
              required
              className={styles.gridInput}
            />
            <button
              type="button"
              onClick={() => removeAddress(index)}
              className={styles.removeButton}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addAddress} className={styles.addButton}>
          Add Address
        </button>
        <br />
        <button type="submit" className={styles.submitButton}>Submit</button>
      </form>
    </div>
  );
}

export default SubmitUserPage;
