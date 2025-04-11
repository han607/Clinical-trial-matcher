import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ClinicalTrial, Criterion } from '../types';

interface CreateTrialFormProps {
  onSubmit: (trial: Omit<ClinicalTrial, 'id'>) => void;
  onUpdate?: (trial: ClinicalTrial) => void;
  editTrial?: ClinicalTrial;
  existingCategories: string[];
}

const CreateTrialForm: React.FC<CreateTrialFormProps> = ({ 
  onSubmit, 
  onUpdate, 
  editTrial, 
  existingCategories 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [newCriterion, setNewCriterion] = useState('');
  const [criterionType, setCriterionType] = useState<'inclusion' | 'exclusion'>('inclusion');
  const [inclusionCriteria, setInclusionCriteria] = useState<Criterion[]>([]);
  const [exclusionCriteria, setExclusionCriteria] = useState<Criterion[]>([]);

  // Load trial data if in edit mode
  useEffect(() => {
    if (editTrial) {
      setName(editTrial.name);
      setDescription(editTrial.description);
      setCategory(editTrial.category);
      setInclusionCriteria(editTrial.inclusionCriteria);
      setExclusionCriteria(editTrial.exclusionCriteria);
    }
  }, [editTrial]);

  const handleAddCriterion = () => {
    if (!newCriterion.trim()) return;

    const criterion: Criterion = {
      id: `criterion-${Date.now()}`,
      description: newCriterion.trim(),
      type: criterionType,
    };

    if (criterionType === 'inclusion') {
      setInclusionCriteria([...inclusionCriteria, criterion]);
    } else {
      setExclusionCriteria([...exclusionCriteria, criterion]);
    }

    setNewCriterion('');
  };

  const handleRemoveCriterion = (criterionId: string, type: 'inclusion' | 'exclusion') => {
    if (type === 'inclusion') {
      setInclusionCriteria(inclusionCriteria.filter((c) => c.id !== criterionId));
    } else {
      setExclusionCriteria(exclusionCriteria.filter((c) => c.id !== criterionId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim() || (!inclusionCriteria.length && !exclusionCriteria.length)) return;

    const trialData = {
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      inclusionCriteria,
      exclusionCriteria,
    };

    if (editTrial && onUpdate) {
      onUpdate({ ...trialData, id: editTrial.id });
    } else {
      onSubmit(trialData);
    }

    // Reset form if not editing
    if (!editTrial) {
      setName('');
      setDescription('');
      setCategory('');
      setInclusionCriteria([]);
      setExclusionCriteria([]);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom>
        {editTrial ? 'Edit Clinical Trial' : 'Create New Clinical Trial'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Trial Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Trial Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          margin="normal"
        />
        <Autocomplete
          freeSolo
          options={existingCategories}
          value={category}
          onChange={(_, newValue) => setCategory(newValue || '')}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Category"
              required
              margin="normal"
              onChange={(e) => setCategory(e.target.value)}
            />
          )}
        />
        
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Add Criteria
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Criterion Description"
              value={newCriterion}
              onChange={(e) => setNewCriterion(e.target.value)}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={criterionType}
                label="Type"
                onChange={(e) => setCriterionType(e.target.value as 'inclusion' | 'exclusion')}
              >
                <MenuItem value="inclusion">Inclusion</MenuItem>
                <MenuItem value="exclusion">Exclusion</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleAddCriterion}
              disabled={!newCriterion.trim()}
            >
              Add
            </Button>
          </Box>
        </Box>

        <Typography variant="subtitle1">Inclusion Criteria:</Typography>
        <List>
          {inclusionCriteria.map((criterion) => (
            <ListItem key={criterion.id}>
              <ListItemText primary={criterion.description} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleRemoveCriterion(criterion.id, 'inclusion')}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1">Exclusion Criteria:</Typography>
        <List>
          {exclusionCriteria.map((criterion) => (
            <ListItem key={criterion.id}>
              <ListItemText primary={criterion.description} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleRemoveCriterion(criterion.id, 'exclusion')}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          disabled={!name.trim() || !category.trim() || (!inclusionCriteria.length && !exclusionCriteria.length)}
        >
          {editTrial ? 'Update Trial' : 'Create Trial'}
        </Button>
      </Box>
    </Paper>
  );
};

export default CreateTrialForm; 