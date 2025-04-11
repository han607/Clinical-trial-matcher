import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ClinicalTrial } from '../types';
import CreateTrialForm from './CreateTrialForm';

interface ClinicalTrialListProps {
  trials: ClinicalTrial[];
  onEditTrial: (trial: ClinicalTrial) => void;
  onDeleteTrial: (trialId: string) => void;
}

const ClinicalTrialList: React.FC<ClinicalTrialListProps> = ({
  trials,
  onEditTrial,
  onDeleteTrial,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingTrial, setEditingTrial] = useState<ClinicalTrial | null>(null);

  const categories = ['all', ...new Set(trials.map((trial) => trial.category))];
  
  const filteredTrials = selectedCategory === 'all'
    ? trials
    : trials.filter((trial) => trial.category === selectedCategory);

  const handleEditClick = (trial: ClinicalTrial) => {
    setEditingTrial(trial);
  };

  const handleEditClose = () => {
    setEditingTrial(null);
  };

  const handleEditSubmit = (updatedTrial: ClinicalTrial) => {
    onEditTrial(updatedTrial);
    setEditingTrial(null);
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Filter by Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" sx={{ ml: 2 }}>
          Showing {filteredTrials.length} trials
        </Typography>
      </Box>

      {filteredTrials.map((trial) => (
        <Card key={trial.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {trial.name}
                </Typography>
                <Chip 
                  label={trial.category}
                  size="small"
                  sx={{ mb: 1 }}
                />
              </Box>
              <Box>
                <IconButton onClick={() => handleEditClick(trial)} size="small">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDeleteTrial(trial.id)} size="small" color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              {trial.description}
            </Typography>
            
            <Typography variant="subtitle1">Inclusion Criteria:</Typography>
            <List dense>
              {trial.inclusionCriteria.map((criterion) => (
                <ListItem key={criterion.id}>
                  <ListItemText primary={criterion.description} />
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 1 }} />
            
            <Typography variant="subtitle1">Exclusion Criteria:</Typography>
            <List dense>
              {trial.exclusionCriteria.map((criterion) => (
                <ListItem key={criterion.id}>
                  <ListItemText primary={criterion.description} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      ))}

      <Dialog
        open={!!editingTrial}
        onClose={handleEditClose}
        maxWidth="md"
        fullWidth
      >
        {editingTrial && (
          <CreateTrialForm
            editTrial={editingTrial}
            onUpdate={handleEditSubmit}
            onSubmit={() => {}}
            existingCategories={categories.filter((c) => c !== 'all')}
          />
        )}
      </Dialog>
    </Box>
  );
};

export default ClinicalTrialList; 