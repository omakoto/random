import React from 'react';
import type { InsoleParameters } from '../lib/generateInsole';
import { defaultParams } from '../lib/generateInsole';
import './InsoleForm.css';

interface InsoleFormProps {
  setParameters: (params: InsoleParameters) => void;
}

const InsoleForm: React.FC<InsoleFormProps> = ({ setParameters }) => {
  const [formState, setFormState] = React.useState<InsoleParameters>(defaultParams);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: parseFloat(e.target.value) || 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParameters(formState);
  };

  return (
    <div className="form-container">
      <h3>Insole Parameters (in mm)</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Foot Length</label>
          <input
            type="number"
            name="footLength"
            value={formState.footLength}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Heel Width</label>
          <input
            type="number"
            name="heelWidth"
            value={formState.heelWidth}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Ball Width</label>
          <input
            type="number"
            name="ballWidth"
            value={formState.ballWidth}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Waist Width</label>
          <input
            type="number"
            name="waistWidth"
            value={formState.waistWidth}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Arch Height</label>
          <input
            type="number"
            name="archHeight"
            value={formState.archHeight}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="go-button">
          Go
        </button>
      </form>
    </div>
  );
};

export default InsoleForm;
