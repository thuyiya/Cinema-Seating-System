import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Box
} from '@mui/material';

export interface ISeat {
  row: number;
  number: number;
  type: 'standard' | 'vip' | 'accessible';
  status: 'available' | 'broken' | 'maintenance';
  position: 'aisle' | 'middle' | 'edge';
  preferredView: boolean;
}

export interface ISection {
  name: string;
  rows: string;
  seatsPerRow: string;
  startRow: number;
  rowLabels: string[];
  seatLabels: string[];
  seats: ISeat[];
}

export interface IScreenFormData {
  number: string;
  name: string;
  sections: ISection[];
  layout: {
    type: 'straight' | 'curved' | 'c-shaped';
    hasBalcony: boolean;
    aislePositions: number[];
  };
  seatingRules: {
    allowSplitGroups: boolean;
    maxGroupSize: number;
    allowSinglesBetweenGroups: boolean;
    preferredStartingRows: number[];
    vipRowsRange: {
      start: number;
      end: number;
    };
    accessibleSeatsLocations: {
      row: number;
      seatStart: number;
      seatEnd: number;
    }[];
  };
}

interface ScreenFormProps {
  formData: IScreenFormData;
  onChange: (data: IScreenFormData) => void;
}

export default function ScreenForm({ formData, onChange }: ScreenFormProps) {
  const handleSectionChange = (index: number, field: keyof ISection, value: any) => {
    const newSections = [...formData.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    onChange({ ...formData, sections: newSections });
  };

  const addSection = () => {
    const lastSection = formData.sections[formData.sections.length - 1];
    const newStartRow = lastSection ? lastSection.startRow + parseInt(lastSection.rows) : 1;
    
    onChange({
      ...formData,
      sections: [
        ...formData.sections,
        {
          name: `Section ${formData.sections.length + 1}`,
          rows: '5',
          seatsPerRow: '10',
          startRow: newStartRow,
          rowLabels: [],
          seatLabels: [],
          seats: []
        }
      ]
    });
  };

  return (
    <Grid container spacing={2}>
      {/* Basic Information */}
      <Grid item xs={6}>
        <TextField
          label="Screen Number"
          type="number"
          fullWidth
          value={formData.number}
          onChange={(e) => onChange({ ...formData, number: e.target.value })}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Name"
          fullWidth
          value={formData.name}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
        />
      </Grid>

      {/* Layout Settings */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Layout Settings</Typography>
      </Grid>
      <Grid item xs={6}>
        <TextField
          select
          label="Layout Type"
          fullWidth
          value={formData.layout.type}
          onChange={(e) => onChange({
            ...formData,
            layout: {
              ...formData.layout,
              type: e.target.value as 'straight' | 'curved' | 'c-shaped'
            }
          })}
          SelectProps={{ native: true }}
        >
          <option value="straight">Straight</option>
          <option value="curved">Curved</option>
          <option value="c-shaped">C-Shaped</option>
        </TextField>
      </Grid>
      <Grid item xs={6}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.layout.hasBalcony}
              onChange={(e) => onChange({
                ...formData,
                layout: { ...formData.layout, hasBalcony: e.target.checked }
              })}
            />
          }
          label="Has Balcony"
        />
      </Grid>

      {/* Sections */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Sections</Typography>
      </Grid>
      {formData.sections.map((section, index) => (
        <React.Fragment key={index}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle1">Section {index + 1}</Typography>
              {index > 0 && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => onChange({
                    ...formData,
                    sections: formData.sections.filter((_, i) => i !== index)
                  })}
                >
                  Remove
                </Button>
              )}
            </Box>
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Section Name"
              fullWidth
              value={section.name}
              onChange={(e) => handleSectionChange(index, 'name', e.target.value)}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Rows"
              type="number"
              fullWidth
              value={section.rows}
              onChange={(e) => handleSectionChange(index, 'rows', e.target.value)}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Seats per Row"
              type="number"
              fullWidth
              value={section.seatsPerRow}
              onChange={(e) => handleSectionChange(index, 'seatsPerRow', e.target.value)}
            />
          </Grid>
        </React.Fragment>
      ))}
      <Grid item xs={12}>
        <Button variant="outlined" onClick={addSection}>
          Add Section
        </Button>
      </Grid>

      {/* Seating Rules */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Seating Rules</Typography>
      </Grid>
      <Grid item xs={6}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.seatingRules.allowSplitGroups}
              onChange={(e) => onChange({
                ...formData,
                seatingRules: {
                  ...formData.seatingRules,
                  allowSplitGroups: e.target.checked
                }
              })}
            />
          }
          label="Allow Split Groups"
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Max Group Size"
          type="number"
          fullWidth
          value={formData.seatingRules.maxGroupSize}
          onChange={(e) => onChange({
            ...formData,
            seatingRules: {
              ...formData.seatingRules,
              maxGroupSize: parseInt(e.target.value)
            }
          })}
        />
      </Grid>
      <Grid item xs={6}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.seatingRules.allowSinglesBetweenGroups}
              onChange={(e) => onChange({
                ...formData,
                seatingRules: {
                  ...formData.seatingRules,
                  allowSinglesBetweenGroups: e.target.checked
                }
              })}
            />
          }
          label="Allow Singles Between Groups"
        />
      </Grid>
    </Grid>
  );
} 