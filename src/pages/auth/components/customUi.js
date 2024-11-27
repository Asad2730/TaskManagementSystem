

export const CustomInput = ({ id, label, type, value, onChange }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      id={id}
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      value={value}
      onChange={onChange}
      required
    />
  </div>
);





export const CustomButton = ({ label, onClick, disabled, loading,type }) => (
  <button
    type={type}
    className={`w-full py-2 px-4 rounded-md transition ${
      loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"
    }`}
    onClick={onClick}
    disabled={disabled}
  >
    {loading ? "Loading..." : label}
  </button>
);

export default Button;
