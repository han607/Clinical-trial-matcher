import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { Criterion, Patient } from '../types';

interface PatientFormProps {
  categories: string[];
  getCriteriaForCategory: (category: string) => Criterion[];
  onSubmit: (newPatient: Omit<Patient, 'id'>) => void;
  initialPatient?: Patient | null;
}

const PatientForm: React.FC<PatientFormProps> = ({ 
  categories, 
  getCriteriaForCategory,
  onSubmit,
  initialPatient = null,
}) => {
  const [name, setName] = useState<string>(initialPatient?.name || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialPatient?.selectedCategory || (categories.length > 0 ? categories[0] : '')
  );
  const [selectedCriteria, setSelectedCriteria] = useState<Set<string>>(
    new Set(initialPatient?.selectedCriteria || [])
  );

  useEffect(() => {
    if (initialPatient) {
      setName(initialPatient.name);
      setSelectedCategory(initialPatient.selectedCategory);
      setSelectedCriteria(new Set(initialPatient.selectedCriteria));
    }
  }, [initialPatient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      selectedCategory,
      selectedCriteria: Array.from(selectedCriteria),
    });
    setName('');
    setSelectedCategory('');
    setSelectedCriteria(new Set());
  };

  const handleCriterionToggle = (criterion: Criterion) => {
    const criterionId = `${criterion.type}-${criterion.description}`;
    const newSelectedCriteria = new Set(selectedCriteria);
    if (newSelectedCriteria.has(criterionId)) {
      newSelectedCriteria.delete(criterionId);
    } else {
      newSelectedCriteria.add(criterionId);
    }
    setSelectedCriteria(newSelectedCriteria);
  };

  const criteria = getCriteriaForCategory(selectedCategory);
  const inclusionCriteria = criteria.filter((c) => c.type === 'inclusion');
  const exclusionCriteria = criteria.filter((c) => c.type === 'exclusion');

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom>
        {initialPatient ? 'Edit Patient' : 'Create New Patient'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Patient Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          margin="normal"
        />

        <FormControl fullWidth margin="normal" required>
          <InputLabel>Trial Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Trial Category"
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedCriteria(new Set());
            }}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedCategory && (
          <>
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              Patient Characteristics
            </Typography>
            
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Inclusion Criteria:
            </Typography>
            <FormGroup>
              {inclusionCriteria.map((criterion) => (
                <FormControlLabel
                  key={criterion.id}
                  control={
                    <Checkbox
                      checked={selectedCriteria.has(`inclusion-${criterion.description}`)}
                      onChange={() => handleCriterionToggle(criterion)}
                    />
                  }
                  label={criterion.description}
                />
              ))}
            </FormGroup>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1">
              Exclusion Criteria:
            </Typography>
            <FormGroup>
              {exclusionCriteria.map((criterion) => (
                <FormControlLabel
                  key={criterion.id}
                  control={
                    <Checkbox
                      checked={selectedCriteria.has(`exclusion-${criterion.description}`)}
                      onChange={() => handleCriterionToggle(criterion)}
                    />
                  }
                  label={criterion.description}
                />
              ))}
            </FormGroup>
          </>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          disabled={!name || !selectedCategory}
        >
          {initialPatient ? 'Update Patient' : 'Create Patient'}
        </Button>
      </Box>
    </Paper>
  );
};

export default PatientForm; 