

export const CustomTextInput = ({  value, onChange, placeholder, required, type = "text" }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {placeholder}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
};


export const CustomDropdown = ({  value, onChange, options, placeholder, required }) => {
  return (
    <div className="mb-4">
      <label  className="block text-sm font-medium text-gray-700 mb-2">
        {placeholder}
      </label>
      <select
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={value}
        onChange={onChange}
        required={required}
      >
        <option value="">{`Select ${placeholder}`}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};



