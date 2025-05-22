import React from 'react';
import { Box, Paper, Typography, Tooltip, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

type SeatType = 'REGULAR' | 'VIP' | 'ACCESSIBLE';
type SeatStatus = 'available' | 'booked' | 'broken' | 'maintenance';
type SeatPosition = 'aisle' | 'middle' | 'edge';
type SeatClass = SeatType | 'selected' | 'booked' | 'broken' | 'maintenance' | SeatPosition;

const StyledSeat = styled(Paper)(({ theme }) => ({
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  margin: 2,
  position: 'relative',
  fontWeight: 'bold',
  transition: 'all 0.2s ease',
  fontSize: '0.75rem',
  '&.REGULAR': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  '&.VIP': {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    border: `2px solid ${theme.palette.secondary.dark}`,
  },
  '&.ACCESSIBLE': {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.info.contrastText,
    border: `2px solid ${theme.palette.info.dark}`,
  },
  '&.broken': {
    backgroundColor: '#ff1744',
    color: '#ffffff',
    border: `2px solid #b2102f`,
  },
  '&.maintenance': {
    backgroundColor: '#ffd600',
    color: '#000000',
    border: `2px solid #c7a500`,
  },
  '&.booked': {
    backgroundColor: '#4caf50',
    color: '#ffffff',
    cursor: 'not-allowed',
    '&::after': {
      content: '"×"',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#ffffff',
    }
  },
  '&.aisle': {
    borderLeft: `2px solid ${theme.palette.primary.light}`,
    borderRight: `2px solid ${theme.palette.primary.light}`,
  },
  '&.edge': {
    borderLeft: `2px solid ${theme.palette.primary.light}`,
  },
  '&:hover:not(.booked)': {
    opacity: 0.9,
    transform: 'scale(1.05)',
  },
  '&.selected': {
    border: `2px solid ${theme.palette.primary.light}`,
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.common.white,
  },
  '&.broken, &.maintenance': {
    cursor: 'pointer',
  },
  '&.booked:not(.admin)': {
    cursor: 'not-allowed',
  }
}));

interface Seat {
  id: string;
  row: string;
  number: number;
  type: SeatType;
  isBooked: boolean;
  status?: SeatStatus;
  position: SeatPosition;
  preferredView: boolean;
}

interface Section {
  name: string;
  seats: Seat[];
}

interface SeatLayoutProps {
  sections: Section[];
  layout?: {
    type: 'straight' | 'curved' | 'c-shaped';
    hasBalcony: boolean;
    aislePositions: number[];
  };
  selectedSeats?: string[];
  onSeatClick: (seatId: string, seat: Seat) => void;
  isAdminView?: boolean;
}

const SeatLayout: React.FC<SeatLayoutProps> = ({
  sections,
  layout = { type: 'straight', hasBalcony: false, aislePositions: [] },
  selectedSeats = [],
  onSeatClick,
  isAdminView = false
}) => {
  const getTransform = (seatIndex: number, totalSeats: number) => {
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

  const getSeatClass = (seat: Seat) => {
    const classes: SeatClass[] = [seat.type];
    
    // Handle seat status
    if (selectedSeats?.includes(seat.id)) {
      classes.push('selected' as SeatClass);
    }
    
    // Handle seat status
    if (seat.status === 'broken') {
      classes.push('broken' as SeatClass);
    } else if (seat.status === 'maintenance') {
      classes.push('maintenance' as SeatClass);
    } else if (seat.status === 'booked' || seat.isBooked) {
      classes.push('booked' as SeatClass);
    }
    
    if (seat.position) {
      classes.push(seat.position as SeatClass);
    }
    
    return classes.join(' ');
  };

  const getRowLabel = (row: string) => {
    if (/^[A-Z]$/.test(row)) return row;
    
    const rowNum = parseInt(row);
    if (rowNum > 0) {
      return String.fromCharCode(64 + rowNum);
    }
    return row;
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
            {Array.from(new Set(section.seats.map(s => s.row)))
              .sort((a, b) => {
                // Convert row labels to numbers for comparison
                const rowA = parseInt(a);
                const rowB = parseInt(b);
                
                // If both are numbers, compare numerically
                if (!isNaN(rowA) && !isNaN(rowB)) {
                  return rowA - rowB;
                }
                
                // Get the row letters
                const letterA = getRowLabel(a);
                const letterB = getRowLabel(b);
                
                // Compare alphabetically
                return letterA.localeCompare(letterB);
              })
              .map((row, rowIndex) => {
                const rowSeats = section.seats.filter(s => s.row === row).sort((a, b) => a.number - b.number);
                const rowLetter = getRowLabel(row);
                
                return (
                  <Box
                    key={row}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1,
                      transform: layout.type !== 'straight' ? `translateZ(${rowIndex * 5}px)` : 'none',
                    }}
                  >
                    <Typography sx={{ mr: 2, minWidth: 30, fontWeight: 'bold' }}>
                      {rowLetter}
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                      {rowSeats.map((seat, seatIndex) => {
                        const isAisle = layout?.aislePositions?.includes(seat.number);
                        const seatLabel = `${rowLetter}${seat.number}`;
                        const isDisabled = !isAdminView && (seat.status === 'booked' || seat.isBooked);

                        return (
                          <React.Fragment key={seat.id}>
                            {isAisle && <Box sx={{ width: 20 }} />}
                            <Tooltip title={`${seatLabel} - ${seat.type}${seat.status ? ` (${seat.status})` : ''}`}>
                              <StyledSeat
                                className={`${getSeatClass(seat)}${isAdminView ? ' admin' : ''}`}
                                onClick={() => !isDisabled && onSeatClick(seat.id, seat)}
                                sx={{
                                  transform: getTransform(seatIndex, rowSeats.length),
                                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                                }}
                              >
                                {seatLabel}
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
            <StyledSeat className="REGULAR">R</StyledSeat>
            <Typography variant="caption">Regular</Typography>
          </Grid>
          <Grid item>
            <StyledSeat className="VIP">V</StyledSeat>
            <Typography variant="caption">VIP</Typography>
          </Grid>
          <Grid item>
            <StyledSeat className="ACCESSIBLE">A</StyledSeat>
            <Typography variant="caption">Accessible</Typography>
          </Grid>
          <Grid item>
            <StyledSeat className="booked">{/* Empty content, X will be added by ::after */}</StyledSeat>
            <Typography variant="caption">Booked</Typography>
          </Grid>
          {isAdminView && (
            <>
              <Grid item>
                <StyledSeat className="broken">B</StyledSeat>
                <Typography variant="caption">Broken</Typography>
              </Grid>
              <Grid item>
                <StyledSeat className="maintenance">M</StyledSeat>
                <Typography variant="caption">Maintenance</Typography>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default SeatLayout; 