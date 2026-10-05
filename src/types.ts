export type CurbsideStatus = 'waiting' | 'curbside' | 'boarded';
export type PaymentStatus = 'paid' | 'pending' | 'in_escrow';
export type SplitMode = 'equal' | 'distance_proportional' | 'custom';
export type TripCategory = 'airport' | 'getaway' | 'festival' | 'commute';
export type TripStatus = 'planning' | 'booked' | 'en_route' | 'completed';

export interface RiderLuggage {
  carryOn: number;
  checked: number;
  sportsGear?: string; // e.g., 'Ski bag', 'Surfboard', 'Golf club'
}

export interface Rider {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  pickupAddress: string;
  pickupTime: string;
  luggage: RiderLuggage;
  curbsideStatus: CurbsideStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'apple_pay' | 'venmo' | 'credit_card' | 'revolut';
  distanceMiles: number; // distance contribution
  allocatedFare: number;
  isHost: boolean;
  notes?: string;
  x?: number; // map coordinates normalized (0-100)
  y?: number;
}

export interface Vehicle {
  id: string;
  name: string;
  category: 'van' | 'suv' | 'eco_shuttle' | 'coach';
  model: string;
  image: string;
  maxPassengers: number;
  maxLuggage: number;
  baseRate: number;
  perMileRate: number;
  features: string[];
  description: string;
  carbonOffsetKg: number;
}

export interface Driver {
  id: string;
  name: string;
  rating: number;
  totalTrips: number;
  avatar: string;
  carModel: string;
  licensePlate: string;
  phoneNumber: string;
  languages: string[];
}

export interface JukeboxTrack {
  id: string;
  title: string;
  artist: string;
  addedBy: string;
  votes: number;
  isPlaying: boolean;
  duration: string;
}

export interface CabinSettings {
  temperatureF: number;
  quietMode: boolean;
  acFanSpeed: 'low' | 'auto' | 'high';
  moodLightColor: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface TripLocation {
  name: string;
  address: string;
  x: number; // 0 - 100 percentage in map view
  y: number;
}

export interface Trip {
  id: string;
  title: string;
  category: TripCategory;
  date: string;
  targetArrivalTime: string;
  status: TripStatus;
  origin: TripLocation;
  destination: TripLocation;
  riders: Rider[];
  vehicle: Vehicle;
  splitMode: SplitMode;
  driver: Driver;
  totalDistanceMiles: number;
  estimatedDurationMins: number;
  baseTotalFare: number;
  groupChat: ChatMessage[];
  jukebox: JukeboxTrack[];
  cabinSettings: CabinSettings;
  emergencyPin: string;
  inviteCode: string;
}

export interface SharedPoolTrip {
  id: string;
  title: string;
  category: TripCategory;
  originName: string;
  originAddress: string;
  destinationName: string;
  destinationAddress: string;
  departureDate: string;
  departureTime: string;
  totalSeats: number;
  bookedSeats: number;
  pricePerSeat: number;
  vehicleModel: string;
  vehicleImage: string;
  host: {
    name: string;
    avatar: string;
    rating: number;
    completedSharedTrips: number;
  };
  pickupCorridor: string[];
  features: string[];
  allowLuggage: boolean;
}
