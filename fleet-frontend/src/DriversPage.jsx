                  min="0"
                  max="5"
                  step="0.1"
                />

              </div>

              {/* BUTTONS */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                  marginTop: "24px",
                  paddingTop:
                    "18px",
                  borderTop:
                    "1px solid #edf0f4",
                }}
              >

                <button
                  type="button"
                  className="more-button"
                  onClick={closeModal}
                  style={{
                    padding:
                      "10px 18px",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  <Plus size={17} />

                  {editingDriver
                    ? "Save Changes"
                    : "Add Driver"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

/* =========================
   DRIVER STAT CARD
========================= */

function DriverStatCard({
  title,
  value,
  suffix = "",
  icon,
}) {
  return (
    <div className="stat-card">

      <div className="stat-top">

        <div className="stat-icon">
          {icon}
        </div>

        <span className="change positive">
          LIVE
        </span>

      </div>

      <div className="stat-value">
        {value}
        {suffix}
      </div>

      <div className="stat-bottom">

        <span>
          {title}
        </span>

        <small>
          from database
        </small>

      </div>

    </div>
  );
}

/* =========================
   FORM FIELD
========================= */

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
  max,
  step,
}) {
  return (
    <div>

      <label
        style={{
          display: "block",
          marginBottom: "7px",
          fontSize: "12px",
          fontWeight: "700",
          color: "#394150",
        }}
      >
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "11px 12px",
          border:
            "1px solid #dfe3e8",
          borderRadius: "9px",
          outline: "none",
          fontSize: "13px",
        }}
      />

    </div>
