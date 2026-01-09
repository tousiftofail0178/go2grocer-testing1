import React from 'react';
import styles from './AddressFormFields.module.css';

export interface AddressData {
    street: string;
    area: string;
    city: string;
    postalCode: string;
    customArea?: string;
}

interface AddressFormFieldsProps {
    prefix: string;
    data: AddressData;
    onChange: (field: keyof AddressData, value: string) => void;
}

const AREAS = [
    'Pahartali', 'Kattali', 'Panchlaish – GEC', 'Chandgaon', 'Lalkhan Bazar',
    'Chawkbazar', 'Andarkilla – Old City', 'Jamal Khan – Enayet Bazar', 'Bakalia',
    'Agrabad (CBD)', 'Madarbari', 'Pathantooly', 'Firingee Bazar – Boxirhat',
    'Patharghata', 'Halishahar (North)', 'Halishahar (Middle)',
    'Halishahar (South & EPZ)', 'Patenga'
];

const CITIES = ['Chittagong', 'Dhaka', 'Cox\'s Bazaar'];

export function AddressFormFields({ prefix, data, onChange }: AddressFormFieldsProps) {
    // Logic: If area is not in our list, OR if it is explicitly "Other", treat as custom.
    const isCustomArea = (data.area && !AREAS.includes(data.area)) || data.area === 'Other';
    const dropdownValue = isCustomArea ? 'Other' : (data.area || '');

    const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'Other') {
            // FIX: Set area to 'Other' so the dropdown stays selected
            onChange('area', 'Other');
            onChange('customArea', '');
        } else {
            onChange('area', val);
            onChange('customArea', '');
        }
    };

    return (
        <div className={styles.card}>
            {/* Header */}
            <div className={styles.header}>
                <h3 className={styles.title}>
                    {prefix === 'owner' ? '📍 Personal Address' :
                        prefix === 'business' ? '🏢 Business Location' :
                            '👤 Manager Address'}
                </h3>
                <p className={styles.subtitle}>
                    {prefix === 'business'
                        ? 'Required for logistics and route planning.'
                        : 'Used for billing and profile verification.'}
                </p>
            </div>

            {/* Body */}
            <div className={styles.body}>

                {/* Street */}
                <div className={styles.group}>
                    <label htmlFor={`${prefix}-street`} className={styles.label}>
                        Street Address <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        id={`${prefix}-street`}
                        required
                        value={data.street}
                        onChange={(e) => onChange('street', e.target.value)}
                        placeholder="e.g. House 12, Road 5"
                        className={styles.input}
                    />
                </div>

                {/* Area */}
                <div className={styles.group}>
                    <label htmlFor={`${prefix}-area`} className={styles.label}>
                        Area / Zone <span className={styles.required}>*</span>
                    </label>
                    <select
                        id={`${prefix}-area`}
                        required
                        value={dropdownValue}
                        onChange={handleAreaChange}
                        className={styles.select}
                    >
                        {/* FIX: Generic placeholder text */}
                        <option value="">Select zone...</option>
                        {AREAS.map((area) => (
                            <option key={area} value={area}>{area}</option>
                        ))}
                        <option value="Other">Other (Specify manually)</option>
                    </select>
                </div>

                {/* Custom Area - Only shows if 'Other' is selected */}
                {dropdownValue === 'Other' && (
                    <div className={`${styles.group} ${styles.slideDown}`}>
                        <label htmlFor={`${prefix}-custom-area`} className={styles.label}>
                            Specific Area Name <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="text"
                            id={`${prefix}-custom-area`}
                            required
                            value={data.customArea || ''}
                            onChange={(e) => {
                                const newVal = e.target.value;
                                onChange('customArea', newVal);
                                // FIX: If user clears input, keep 'Other' so dropdown doesn't reset
                                onChange('area', newVal || 'Other');
                            }}
                            placeholder="Type your area name..."
                            className={styles.input}
                        />
                    </div>
                )}

                {/* City & Zip Row */}
                <div className={styles.row}>
                    <div className={styles.group} style={{ flex: 2 }}>
                        <label htmlFor={`${prefix}-city`} className={styles.label}>
                            City <span className={styles.required}>*</span>
                        </label>
                        <select
                            id={`${prefix}-city`}
                            required
                            value={data.city}
                            onChange={(e) => onChange('city', e.target.value)}
                            className={styles.select}
                        >
                            {CITIES.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.group} style={{ flex: 1 }}>
                        <label htmlFor={`${prefix}-zip`} className={styles.label}>
                            Postal Code
                        </label>
                        <input
                            type="text"
                            id={`${prefix}-zip`}
                            value={data.postalCode}
                            onChange={(e) => onChange('postalCode', e.target.value)}
                            placeholder="1212"
                            className={styles.input}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
