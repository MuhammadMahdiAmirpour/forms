import React, { useState, useEffect, useCallback, memo } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { submitUser, getUsers, editAddress, deleteAddress } from "../api";
import { User, Address } from "../types";
import styles from "../styles/SubmitUserPage.module.css";

// Add these interfaces
interface AddressAction {
  type: 'edit' | 'delete';
  address: Address;
  index: number;
}

interface FormDataType {
  firstname: string;
  lastname: string;
  phone_number: string;
  gender: string;
  persian_date: string;
  addresses: Address[];
}

const initialFormData: FormDataType = {
  firstname: "",
  lastname: "",
  phone_number: "",
  gender: "",
  persian_date: "",
  addresses: [],
};

const initialAddressData: Address = {
  subject: "",
  details: "",
};

const AddressActions = memo(({ 
  onEdit, 
  onDelete 
}: {
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) => (
  <div className={styles.addressActions}>
    <button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onEdit(e);
      }} 
      className={styles.editButton}
    >
      Edit
    </button>
    <button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(e);
      }} 
      className={styles.deleteButton}
    >
      Delete
    </button>
  </div>
));

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
  addresses,
  isEditing,
  onEditAddress,
  onDeleteAddress
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
  isEditing: boolean;
  onEditAddress: (address: Address, index: number) => void;
  onDeleteAddress: (address: Address, index: number) => void;
}) => (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <h2>{isEditing ? 'Edit User' : 'New User'}</h2>
      <form onSubmit={onSubmit}>
        <div className={styles.formSection}>
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
          <FormInput
            label="Phone Number"
            name="phone_number"
            value={formData.phone_number}
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
              format="YYYYMMDD"
              calendarPosition="bottom-center"
            />
          </div>
        </div>

        <div className={styles.addressSection}>
          <div className={styles.addressHeader}>
            <h3>Addresses</h3>
            <button type="button" onClick={onAddAddress}>Add Address</button>
          </div>
            {addresses.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Details</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {addresses.map((address, index) => (
                    <tr key={index}>
                      <td>{address.subject}</td>
                      <td>{address.details}</td>
                      <td>
                        <AddressActions
                          onEdit={() => onEditAddress(address, index)}
                          onDelete={() => onDeleteAddress(address, index)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className={styles.noAddresses}>No addresses added yet</p>
            )}
        </div>
        <div className={styles.buttonGroup}>
          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : isEditing ? 'Update' : 'Submit'}
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
  onClose,
  isEditing // Add this prop
}: {
  address: Address;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onClose: () => void;
  isEditing: boolean; // Add this type
}) => (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <h2>{isEditing ? 'Edit Address' : 'New Address'}</h2>
      <div className={styles.addressFormGrid}>
        <div className={styles.formGroup}>
          <label>Subject:</label>
          <input
            type="text"
            name="subject"
            value={address.subject}
            onChange={onInputChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Details:</label>
          <input
            type="text"
            name="details"
            value={address.details}
            onChange={onInputChange}
            required
          />
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <button 
          type="button" 
          onClick={onSubmit}
          disabled={!address.subject || !address.details}
        >
          {isEditing ? 'Update' : 'Add'}
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
  loading,
  error,
  onEditUser
}: {
  users: User[];
  loading: boolean;
  error: string | null;
  onEditUser: (user: User) => void;
}) => (
  <div className={styles.gridContainer}>
    {loading && <div>Loading...</div>}
    {error && <div className={styles.error}>{error}</div>}
    <table className={styles.table}>
      <thead>
        <tr><th>First Name</th><th>Last Name</th><th>Phone Number</th><th>Gender</th><th>Actions</th></tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.firstname}</td>
            <td>{user.lastname}</td>
            <td>{user.phone_number}</td>
            <td>{user.gender}</td>
            <td>
              <button 
                onClick={() => onEditUser(user)}
                className={styles.editButton}
              >
                Edit
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingAddress, setEditingAddress] = useState<{address: Address, index: number} | null>(null);
  const [deletedAddresses, setDeletedAddresses] = useState<number[]>([]);
  const [editedAddresses, setEditedAddresses] = useState<{ [key: number]: Address }>({});

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

  const handleEditAddress = useCallback((address: Address, index: number) => {
    setEditingAddress({ address, index });
    setNewAddress({...address});
    setShowAddressModal(true);
  }, []);

  const handleDeleteAddress = useCallback((address: Address, index: number) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    if (address.id) {
      setDeletedAddresses(prev => [...prev, address.id!]);
    }

    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
  }, []);

  const handleEditUser = useCallback((user: User) => {
    setFormData({
      firstname: user.firstname,
      lastname: user.lastname,
      phone_number: user.phone_number,
      gender: user.gender,
      persian_date: user.persian_date ? user.persian_date.replace(/\//g, '') : "",
      addresses: user.addresses || [],
    });

    if (user.persian_date) {
      try {
        const cleanDate = user.persian_date.replace(/\//g, '');
        setSelectedDate(cleanDate);
      } catch (error) {
        console.error('Error parsing date:', error);
        setSelectedDate(null);
      }
    } else {
      setSelectedDate(null);
    }

    setIsEditing(true);
    setEditingUserId(user.id);
    setShowUserModal(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && editingUserId) {
        // First update the user data
        await submitUser({ 
          ...formData, 
          id: editingUserId 
        });

        // Handle edited addresses
        const editPromises = Object.entries(editedAddresses).map(([id, address]) => 
          editAddress(editingUserId, Number(id), address)
            .catch(error => {
              console.error(`Failed to update address ${id}:`, error);
              return null;
            })
        );

        // Handle deleted addresses
        const deletePromises = deletedAddresses.map(addressId => 
          deleteAddress(editingUserId, addressId)
            .catch(error => {
              console.error(`Failed to delete address ${addressId}:`, error);
              return null;
            })
        );

        // Wait for all operations to complete
        await Promise.all([...editPromises, ...deletePromises]);
      } else {
        // Create new user
        await submitUser(formData);
      }

      // Refresh the users list
      await loadUsers();
      setShowUserModal(false);
      resetForm();
    } catch (error) {
      setError(isEditing ? "Failed to update user" : "Failed to create user");
      console.error('Submission error:', error);
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

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setSelectedDate(null);
    setNewAddress(initialAddressData);
    setIsEditing(false);
    setEditingUserId(null);
    setEditingAddress(null);
    setDeletedAddresses([]); // Clear deleted addresses
    setEditedAddresses({}); // Clear edited addresses
  }, []);
  
  const handleDateChange = useCallback((date: any) => {
    if (!date) {
      setSelectedDate(null);
      setFormData(prev => ({
        ...prev,
        persian_date: ""
      }));
      return;
    }

    try {
      // Convert the date to format without slashes
      const formattedDate = typeof date.format === 'function' 
        ? date.format("YYYYMMDD")  // Changed from "YYYY/MM/DD" to "YYYYMMDD"
        : new Date(date).toLocaleDateString('fa-IR').replace(/\//g, '');

      setSelectedDate(date);
      setFormData(prev => ({
        ...prev,
        persian_date: formattedDate
      }));
    } catch (error) {
      console.error('Error formatting date:', error);
    }
  }, []);

  const handleAddressInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleAddressSubmit = useCallback(() => {
    if (editingAddress) {
      // Update existing address
      const updatedAddresses = [...formData.addresses];
      updatedAddresses[editingAddress.index] = newAddress;

      // If the address has an ID, track it for later update
      if (newAddress.id) {
        setEditedAddresses(prev => ({
          ...prev,
          [newAddress.id]: newAddress
        }));
      }

      setFormData(prev => ({
        ...prev,
        addresses: updatedAddresses
      }));
    } else {
      // Add new address
      setFormData(prev => ({
        ...prev,
        addresses: [...prev.addresses, newAddress]
      }));
    }
    
    setShowAddressModal(false);
    setNewAddress(initialAddressData);
    setEditingAddress(null);
  }, [editingAddress, formData.addresses, newAddress]);

  const handleViewAddresses = useCallback((user: User) => {
    setSelectedUser(user);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>User Management</h1>
        <button 
          onClick={() => setShowUserModal(true)}
          className={styles.addButton}
        >
          Add New User
        </button>
      </div>

      <UsersGrid 
        users={users}
        loading={loading}
        error={error}
        onEditUser={handleEditUser}
      />

      {showUserModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <UserFormModal
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              onAddAddress={() => {
                setNewAddress(initialAddressData);
                setEditingAddress(null);
                setShowAddressModal(true);
              }}
              onClose={() => {
                setShowUserModal(false);
                resetForm();
              }}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              loading={loading}
              addresses={formData.addresses}
              isEditing={isEditing}
              onEditAddress={handleEditAddress}
              onDeleteAddress={handleDeleteAddress}
            />
          </div>

          {showAddressModal && (
            <div 
              className={styles.addressModalOverlay} 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div 
                className={styles.modal} 
                onClick={(e) => e.stopPropagation()}
              >
                <AddressFormModal
                  address={newAddress}
                  onInputChange={handleAddressInputChange}
                  onSubmit={handleAddressSubmit}
                  onClose={() => {
                    setShowAddressModal(false);
                    setNewAddress(initialAddressData);
                    setEditingAddress(null);
                  }}
                  isEditing={!!editingAddress}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SubmitUserPage;
