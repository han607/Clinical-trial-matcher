import { useState, useCallback, useEffect } from 'react'
import {
  Container,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tab,
  Tabs,
  ThemeProvider,
  createTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Paper,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import AssessmentIcon from '@mui/icons-material/Assessment'
import ClinicalTrialList from './components/ClinicalTrialList'
import PatientForm from './components/PatientForm'
import EligibilityChecker from './components/EligibilityChecker'
import CreateTrialForm from './components/CreateTrialForm'
import { ClinicalTrial, Patient, Criterion } from './types'

// Storage keys
const STORAGE_KEYS = {
  TRIALS: 'clinical-trials',
  PATIENTS: 'patients',
  SELECTED_PATIENT: 'selected-patient'
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
})

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function App() {
  const [currentTab, setCurrentTab] = useState(0)
  const [trials, setTrials] = useState<ClinicalTrial[]>(() => {
    const savedTrials = localStorage.getItem(STORAGE_KEYS.TRIALS);
    return savedTrials ? JSON.parse(savedTrials) : [];
  })
  const [patients, setPatients] = useState<Patient[]>(() => {
    const savedPatients = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    return savedPatients ? JSON.parse(savedPatients) : [];
  })
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(() => {
    const savedSelectedPatient = localStorage.getItem(STORAGE_KEYS.SELECTED_PATIENT);
    return savedSelectedPatient ? JSON.parse(savedSelectedPatient) : null;
  })
  const [deleteTrialId, setDeleteTrialId] = useState<string | null>(null)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [clearDataDialog, setClearDataDialog] = useState<'trials' | 'patients' | null>(null)
  const [showPatientReport, setShowPatientReport] = useState(false);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRIALS, JSON.stringify(trials));
  }, [trials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PATIENT, JSON.stringify(selectedPatient));
  }, [selectedPatient]);

  const categories = Array.from(new Set(trials.map((trial) => trial.category)))

  const handleAddTrial = (newTrial: Omit<ClinicalTrial, 'id'>) => {
    const trial: ClinicalTrial = {
      ...newTrial,
      id: `trial-${Date.now()}`, // Use timestamp for unique IDs
    }
    setTrials([...trials, trial])
    setCurrentTab(1) // Switch to trials list tab
  }

  const handleEditTrial = (updatedTrial: ClinicalTrial) => {
    setTrials(trials.map((trial) => 
      trial.id === updatedTrial.id ? updatedTrial : trial
    ))
  }

  const handleDeleteTrial = (trialId: string) => {
    setDeleteTrialId(trialId)
  }

  const confirmDeleteTrial = () => {
    if (deleteTrialId) {
      setTrials(trials.filter((trial) => trial.id !== deleteTrialId))
      // Remove patient eligibility data if their selected category is affected
      const deletedTrial = trials.find((t) => t.id === deleteTrialId)
      if (deletedTrial) {
        setPatients(patients.filter((p) => p.selectedCategory !== deletedTrial.category))
        if (selectedPatient?.selectedCategory === deletedTrial.category) {
          setSelectedPatient(null)
        }
      }
    }
    setDeleteTrialId(null)
  }

  const handleAddPatient = (newPatient: Omit<Patient, 'id'>) => {
    const patient: Patient = {
      ...newPatient,
      id: `patient-${Date.now()}`, // Use timestamp for unique IDs
    }
    setPatients([...patients, patient])
    setSelectedPatient(patient)
    setCurrentTab(3) // Switch to eligibility checker tab
  }

  const getCriteriaForCategory = useCallback((category: string) => {
    // Get all trials for the selected category
    const categoryTrials = trials.filter((trial) => trial.category === category);
    
    // Create a map to store unique criteria by their description
    const criteriaMap = new Map<string, Criterion>();
    
    categoryTrials.forEach((trial) => {
      // Process inclusion criteria
      trial.inclusionCriteria.forEach((criterion) => {
        const existingCriterion = criteriaMap.get(criterion.description);
        if (!existingCriterion) {
          criteriaMap.set(criterion.description, {
            ...criterion,
            id: `${criterion.type}-${criterion.description}` // Create a consistent ID for duplicate criteria
          });
        }
      });
      
      // Process exclusion criteria
      trial.exclusionCriteria.forEach((criterion) => {
        const existingCriterion = criteriaMap.get(criterion.description);
        if (!existingCriterion) {
          criteriaMap.set(criterion.description, {
            ...criterion,
            id: `${criterion.type}-${criterion.description}` // Create a consistent ID for duplicate criteria
          });
        }
      });
    });
    
    // Convert the map values back to an array
    return Array.from(criteriaMap.values());
  }, [trials])

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleClearDataClick = (type: 'trials' | 'patients') => {
    setClearDataDialog(type);
    handleMenuClose();
  };

  const handleConfirmClearData = () => {
    if (clearDataDialog === 'trials') {
      setTrials([]);
      localStorage.removeItem(STORAGE_KEYS.TRIALS);
    } else if (clearDataDialog === 'patients') {
      setPatients([]);
      setSelectedPatient(null);
      localStorage.removeItem(STORAGE_KEYS.PATIENTS);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_PATIENT);
    }
    setClearDataDialog(null);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setCurrentTab(2); // Switch to patient form tab
  };

  const handleUpdatePatient = (updatedPatientData: Omit<Patient, 'id'>) => {
    if (editingPatient) {
      const updatedPatient = {
        ...updatedPatientData,
        id: editingPatient.id,
      };
      setPatients(patients.map(p => p.id === editingPatient.id ? updatedPatient : p));
      setSelectedPatient(updatedPatient);
      setEditingPatient(null);
      setCurrentTab(3); // Switch to eligibility checker tab
    }
  };

  const checkEligibility = (patient: Patient, trial: ClinicalTrial) => {
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

  const generatePatientReport = () => {
    return patients.map(patient => {
      const eligibleTrials = trials
        .filter(trial => trial.category === patient.selectedCategory)
        .filter(trial => checkEligibility(patient, trial));

      return {
        patient,
        eligibleTrials,
      };
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Clinical Trial Matcher
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => setShowPatientReport(true)}
            sx={{ mr: 1 }}
          >
            <AssessmentIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            edge="end"
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleClearDataClick('trials')}>
              Clear Trial Data
            </MenuItem>
            <MenuItem onClick={() => handleClearDataClick('patients')}>
              Clear Patient Data
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Container>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
          <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
            <Tab label="Create Trial" />
            <Tab label="View Trials" />
            <Tab label="Create Patient" />
            <Tab label="Check Eligibility" />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <CreateTrialForm 
            onSubmit={handleAddTrial}
            existingCategories={categories}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <ClinicalTrialList 
            trials={trials}
            onEditTrial={handleEditTrial}
            onDeleteTrial={handleDeleteTrial}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          {trials.length > 0 ? (
            <PatientForm 
              categories={categories}
              getCriteriaForCategory={getCriteriaForCategory}
              onSubmit={editingPatient ? handleUpdatePatient : handleAddPatient}
              initialPatient={editingPatient}
            />
          ) : (
            <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
              Please create at least one clinical trial first
            </Typography>
          )}
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          {selectedPatient ? (
            <EligibilityChecker 
              trials={trials.filter((t) => t.category === selectedPatient.selectedCategory)} 
              patient={selectedPatient}
              onEditPatient={handleEditPatient}
            />
          ) : (
            <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
              Please create a patient first to check trial eligibility
            </Typography>
          )}
        </TabPanel>
      </Container>

      <Dialog
        open={!!deleteTrialId}
        onClose={() => setDeleteTrialId(null)}
      >
        <DialogTitle>Confirm Delete Trial</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this trial? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTrialId(null)}>Cancel</Button>
          <Button onClick={confirmDeleteTrial} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!clearDataDialog}
        onClose={() => setClearDataDialog(null)}
      >
        <DialogTitle>
          Confirm Clear {clearDataDialog === 'trials' ? 'Trial' : 'Patient'} Data
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear all {clearDataDialog === 'trials' ? 'trial' : 'patient'} data? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDataDialog(null)}>Cancel</Button>
          <Button onClick={handleConfirmClearData} color="error" autoFocus>
            Clear Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Patient Report Dialog */}
      <Dialog
        open={showPatientReport}
        onClose={() => setShowPatientReport(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Patient Eligibility Report</DialogTitle>
        <DialogContent>
          {patients.length === 0 ? (
            <DialogContentText>
              No patients have been created yet.
            </DialogContentText>
          ) : (
            <List>
              {generatePatientReport().map(({ patient, eligibleTrials }) => (
                <ListItem
                  key={patient.id}
                  component={Paper}
                  sx={{ mb: 2, p: 2 }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">
                        {patient.name}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Category: {patient.selectedCategory}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Eligible Trials ({eligibleTrials.length}):
                        </Typography>
                        {eligibleTrials.length > 0 ? (
                          <List dense>
                            {eligibleTrials.map(trial => (
                              <ListItem key={trial.id}>
                                <ListItemText
                                  primary={trial.name}
                                />
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography variant="body2" color="error">
                            No eligible trials found
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPatientReport(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}

export default App
