import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Button,
} from '@mui/material';
import { ClinicalTrial, Patient } from '../types';

interface EligibilityCheckerProps {
  trials: ClinicalTrial[];
  patient: Patient;
  onEditPatient: (patient: Patient) => void;
}

export default function EligibilityChecker({
  trials,
  patient,
  onEditPatient,
}: EligibilityCheckerProps) {
  const checkEligibility = (trial: ClinicalTrial) => {
    // Check if all selected inclusion criteria are met
    const meetsInclusion = trial.inclusionCriteria.every((criterion) =>
      patient.selectedCriteria.includes(`inclusion-${criterion.description}`)
    );

    // Check if no exclusion criteria are met
    const meetsExclusion = trial.exclusionCriteria.every(
      (criterion) => !patient.selectedCriteria.includes(`exclusion-${criterion.description}`)
    );

    return meetsInclusion && meetsExclusion;
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Patient: {patient.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Category: {patient.selectedCategory}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => onEditPatient(patient)}
        >
          Edit Patient
        </Button>
      </Box>

      <List>
        {trials.map((trial) => {
          const isEligible = checkEligibility(trial);
          return (
            <ListItem
              key={trial.id}
              component={Paper}
              sx={{
                mb: 2,
                bgcolor: isEligible ? 'success.light' : 'error.light',
                p: 2,
              }}
            >
              <ListItemText
                primary={trial.name}
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Category: {trial.category}
                    </Typography>
                    <Typography variant="body2" color={isEligible ? 'success.main' : 'error.main'}>
                      {isEligible
                        ? 'Patient is eligible for this trial'
                        : 'Patient is not eligible for this trial'}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          );
        })}
      </List>

      {trials.length === 0 && (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
          No trials found in the selected category.
        </Typography>
      )}
    </Box>
  );
} 