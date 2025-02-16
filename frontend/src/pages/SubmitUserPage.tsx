import React, { useState, useEffect, useCallback, memo } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { submitUser, getUsers } from "../api";
import { User, Address } from "../types";
import styles from "../styles/SubmitUserPage.module.css";

interface FormDataType {
  firstname: string;
  lastname: string;
  gender: string;
  persian_date: string;
  addresses: Address[];
}

const initialFormData: FormDataType = {
  firstname: "",
  lastname: "",
  gender: "",
  persian_date: "",
  addresses: [],
};

const initialAddressData: Address = {
  subject: "",
  details: "",
};

// Memoized Input Component
const FormInput = memo(({ 
  label, 
  name, 
  value, 
  onChange, 
  type = "text", 
  required = false 
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) => (
  <div className={styles.formGroup}>
    <label>{label}:</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
    />
  </div>
));

// Memoized Select Component
const FormSelect = memo(({ 
  label, 
  name, 
  value, 
  onChange, 
  options 
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string; }[];
}) => (
  <div className={styles.formGroup}>
    <label>{label}:</label>
    <select name={name} value={value} onChange={onChange} required>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
));

// Memoized User Form Modal
const UserFormModal = memo(({ 
  formData, 
  onInputChange, 
  onSubmit, 
  onAddAddress, 
  onClose,
  selectedDate,
  onDateChange,
  loading,
  addresses 
}: {
  formData: FormDataType;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onAddAddress: () => void;
  onClose: () => void;
  selectedDate: any;
  onDateChange: (date: any) => void;
  loading: boolean;
  addresses: Address[];
}) => (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <h2>New User</h2>
      <form onSubmit={onSubmit}>
        <FormInput
          label="First Name"
          name="firstname"
          value={formData.firstname}
          onChange={onInputChange}
          required
        />
        <FormInput
          label="Last Name"
          name="lastname"
          value={formData.lastname}
          onChange={onInputChange}
          required
        />
        <FormSelect
          label="Gender"
          name="gender"
          value={formData.gender}
          onChange={onInputChange}
          options={[
            { value: "", label: "Select Gender" },
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" }
          ]}
        />
        <div className={styles.formGroup}>
          <label>Date:</label>
          <DatePicker
            value={selectedDate}
            onChange={onDateChange}
            calendar={persian}
            locale={persian_fa}
            format="YYYY/MM/DD"
            calendarPosition="bottom-center"
          />
        </div>

        {addresses.length > 0 && (
          <div className={styles.addressesTable}>
            <h3>Addresses</h3>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {addresses.map((address, index) => (
                  <tr key={index}>
                    <td>{address.subject}</td>
                    <td>{address.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button type="button" onClick={onAddAddress}>Add Address</button>
          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
));

// Memoized Address Form Modal
const AddressFormModal = memo(({ 
  address, 
  onInputChange, 
  onSubmit, 
  onClose 
}: {
  address: Address;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onClose: () => void;
}) => (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <h2>New Address</h2>
      <FormInput
        label="Subject"
        name="subject"
        value={address.subject}
        onChange={onInputChange}
        required
      />
      <FormInput
        label="Details"
        name="details"
        value={address.details}
        onChange={onInputChange}
        required
      />
      <div className={styles.buttonGroup}>
        <button 
          type="button" 
          onClick={onSubmit}
          disabled={!address.subject || !address.details}
        >
          Add
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  </div>
));

// Memoized Users Grid
const UsersGrid = memo(({ 
  users, 
  onViewAddresses,
  loading,
  error 
}: {
  users: User[];
  onViewAddresses: (user: User) => void;
  loading: boolean;
  error: string | null;
}) => (
  <div className={styles.gridContainer}>
    {loading && <div>Loading...</div>}
    {error && <div className={styles.error}>{error}</div>}
    <table className={styles.table}>
      <thead>
        <tr>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Gender</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.firstname}</td>
            <td>{user.lastname}</td>
            <td>{user.gender}</td>
            <td>{user.persian_date}</td>
            <td>
              <button 
                onClick={() => onViewAddresses(user)} 
                className={styles.viewButton}
              >
                View Addresses
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

function SubmitUserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [newAddress, setNewAddress] = useState<Address>(initialAddressData);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsers();
      setUsers(response);
    } catch (error) {
      setError("Failed to load users");
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitUser(formData);
      await loadUsers();
      setShowUserModal(false);
      resetForm();
    } catch (error) {
      setError("Failed to submit user");
      console.error('Submission error: ', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setSelectedDate(null);
    setNewAddress(initialAddressData);
  }, []);

  const handleDateChange = useCallback((date: any) => {
    setSelectedDate(date);
    const persianDateStr = date ? date.format("YYYYMMDD") : "";
    setFormData(prev => ({
      ...prev,
      persian_date: persianDateStr
    }));
  }, []);

  const handleAddressInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const submitAddress = useCallback(() => {
    if (!newAddress.subject || !newAddress.details) return;

    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, newAddress]
    }));
    setNewAddress(initialAddressData);
    setShowAddressModal(false);
  }, [newAddress]);

  const handleViewAddresses = useCallback((user: User) => {
    setSelectedUser(user);
  }, []);

  // Addresses View Modal
  const AddressesViewModal = memo(() => (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>
          Addresses for {selectedUser?.firstname} {selectedUser?.lastname}
        </h2>
        {selectedUser?.addresses && selectedUser.addresses.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {selectedUser.addresses.map((address, index) => (
                <tr key={index}>
                  <td>{address.subject}</td>
                  <td>{address.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No addresses found for this user.</p>
        )}
        <button 
          onClick={() => setSelectedUser(null)} 
          className={styles.closeButton}
        >
          Close
        </button>
      </div>
    </div>
  ));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Users Management</h1>
        <button 
          onClick={() => {
            setShowUserModal(true);
            resetForm();
          }} 
          className={styles.newButton}
        >
          New User
        </button>
      </div>

      <UsersGrid 
        users={users}
        onViewAddresses={handleViewAddresses}
        loading={loading}
        error={error}
      />
      
      {showUserModal && (
        <UserFormModal
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onAddAddress={() => setShowAddressModal(true)}
          onClose={() => setShowUserModal(false)}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          loading={loading}
          addresses={formData.addresses}
        />
      )}

      {showAddressModal && (
        <AddressFormModal
          address={newAddress}
          onInputChange={handleAddressInputChange}
          onSubmit={submitAddress}
          onClose={() => {
            setShowAddressModal(false);
            setNewAddress(initialAddressData);
          }}
        />
      )}

      {selectedUser && <AddressesViewModal />}

      {error && (
        <div className={styles.errorToast}>
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
    </div>
  );
}

export default SubmitUserPage;
