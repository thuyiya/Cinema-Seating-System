import React from 'react';
import { Box, Paper, Typography, Tooltip, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledSeat = styled(Paper)(({ theme }) => ({
  width: 30,
  height: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  margin: 2,
  '&.standard': {
    backgroundColor: theme.palette.primary.light,
  },
  '&.vip': {
    backgroundColor: theme.palette.secondary.main,
  },
  '&.accessible': {
    backgroundColor: theme.palette.success.light,
  },
  '&.broken': {
    backgroundColor: theme.palette.error.light,
  },
  '&.maintenance': {
    backgroundColor: theme.palette.warning.light,
  },
  '&:hover': {
    opacity: 0.8,
  },
}));

interface Seat {
  row: number;
  number: number;
  type: 'standard' | 'vip' | 'accessible';
  status: 'available' | 'broken' | 'maintenance';
  position: 'aisle' | 'middle' | 'edge';
  preferredView: boolean;
}

interface Section {
  name: string;
  rows: number;
  seatsPerRow: number;
  startRow: number;
  rowLabels: string[];
  seatLabels: string[];
  seats: Seat[];
}

interface SeatVisualizerProps {
  sections: Section[];
  layout: {
    type: 'straight' | 'curved' | 'c-shaped';
    hasBalcony: boolean;
    aislePositions: number[];
  };
  onSeatClick: (section: number, seat: Seat) => void;
}

const SeatVisualizer: React.FC<SeatVisualizerProps> = ({
  sections,
  layout,
  onSeatClick,
}) => {
  const getTransform = (sectionIndex: number, seatIndex: number, totalSeats: number) => {
    if (layout.type === 'straight') return '';
    
    if (layout.type === 'curved') {
      const angle = ((seatIndex - totalSeats / 2) * 2);
      return `rotate(${angle}deg)`;
    }
    
    if (layout.type === 'c-shaped') {
      const angle = ((seatIndex - totalSeats / 2) * 3);
      return `rotate(${angle}deg)`;
    }
    
    return '';
  };

  const getSeatTooltip = (seat: Seat) => {
    return `Row: ${seat.row}
Seat: ${seat.number}
Type: ${seat.type}
Status: ${seat.status}
Position: ${seat.position}
${seat.preferredView ? 'Preferred View' : ''}`;
  };

  return (
    <Box sx={{ mt: 2, overflow: 'auto' }}>
      {sections.map((section, sectionIndex) => (
        <Box key={section.name} sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {section.name}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: layout.type === 'c-shaped' ? 'perspective(1000px)' : 'none',
            }}
          >
            {Array.from({ length: section.rows }).map((_, rowIndex) => {
              const currentRow = section.startRow + rowIndex;
              return (
                <Box
                  key={rowIndex}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1,
                    transform: layout.type !== 'straight' ? `translateZ(${rowIndex * 5}px)` : 'none',
                  }}
                >
                  <Typography sx={{ mr: 2, minWidth: 30 }}>
                    {section.rowLabels[rowIndex] || currentRow}
                  </Typography>
                  <Box sx={{ display: 'flex' }}>
                    {Array.from({ length: section.seatsPerRow }).map((_, seatIndex) => {
                      const seat = section.seats.find(
                        s => s.row === currentRow && s.number === seatIndex + 1
                      ) || {
                        row: currentRow,
                        number: seatIndex + 1,
                        type: 'standard',
                        status: 'available',
                        position: 'middle',
                        preferredView: false,
                      };

                      const isAisle = layout.aislePositions.includes(seatIndex + 1);

                      return (
                        <React.Fragment key={seatIndex}>
                          {isAisle && <Box sx={{ width: 20 }} />}
                          <Tooltip title={getSeatTooltip(seat)}>
                            <StyledSeat
                              className={seat.status === 'available' ? seat.type : seat.status}
                              onClick={() => onSeatClick(sectionIndex, seat)}
                              sx={{
                                transform: getTransform(sectionIndex, seatIndex, section.seatsPerRow),
                              }}
                            >
                              {section.seatLabels[seatIndex] || (seatIndex + 1)}
                            </StyledSeat>
                          </Tooltip>
                        </React.Fragment>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>Legend</Typography>
        <Grid container spacing={2}>
          <Grid item>
            <StyledSeat className="standard">S</StyledSeat>
            <Typography variant="caption">Standard</Typography>
          </Grid>
          <Grid item>
            <StyledSeat className="vip">V</StyledSeat>
            <Typography variant="caption">VIP</Typography>
          </Grid>
          <Grid item>
            <StyledSeat className="accessible">A</StyledSeat>
            <Typography variant="caption">Accessible</Typography>
          </Grid>
          <Grid item>
            <StyledSeat className="broken">B</StyledSeat>
            <Typography variant="caption">Broken</Typography>
          </Grid>
          <Grid item>
            <StyledSeat className="maintenance">M</StyledSeat>
            <Typography variant="caption">Maintenance</Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SeatVisualizer; 