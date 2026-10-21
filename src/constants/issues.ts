import { ReportCategory, IssueOption } from '../types/index.js';

export interface CategoryMeta {
  id: ReportCategory;
  title: string;
  subtitle: string;
  iconName: 'car' | 'steering-wheel' | 'road-line';
  issues: IssueOption[];
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'vehicle_condition',
    title: 'Vehicle condition',
    subtitle: 'Faults, damage or safety issues',
    iconName: 'car',
    issues: [
      {
        code: 'brake_light_out',
        title: 'Brake light not working',
        description: 'Rear brake light failed to illuminate while slowing or stopping.',
      },
      {
        code: 'headlight_indicator_out',
        title: 'Headlight or indicator bulb out',
        description: 'Front light or turn indicator not working properly.',
      },
      {
        code: 'flat_or_low_tyre',
        title: 'Flat tyre / dangerously low pressure',
        description: 'Tyre visibly flat or soft, possible puncture hazard.',
      },
      {
        code: 'exhaust_smoke_rattle',
        title: 'Heavy exhaust smoke / scraping part',
        description: 'Excessive black or blue smoke, or loose component under vehicle.',
      },
      {
        code: 'boot_door_open',
        title: 'Boot or door not fully latched',
        description: 'Boot lid or passenger door slightly ajar while moving.',
      },
      {
        code: 'fuel_cap_open',
        title: 'Fuel cap flap open',
        description: 'Fuel flap or inner screw cap left unscrewed.',
      },
      {
        code: 'loose_cargo_roof',
        title: 'Loose cargo or roof rack load',
        description: 'Items on roof or trailer shifting or improperly secured.',
      },
      {
        code: 'other_vehicle_condition',
        title: 'Other vehicle condition issue',
        description: 'Another observed vehicle fault not listed above.',
      },
    ],
  },
  {
    id: 'driver_behaviour',
    title: 'Driver behaviour',
    subtitle: 'Unsafe or dangerous driving',
    iconName: 'steering-wheel',
    issues: [
      {
        code: 'tailgating_severe',
        title: 'Severe tailgating',
        description: 'Driving dangerously close to vehicle in front without safe braking gap.',
      },
      {
        code: 'swerving_drifting',
        title: 'Drifting across lanes / swerving',
        description: 'Repeatedly crossing road markings or struggling to maintain lane.',
      },
      {
        code: 'phone_use_driving',
        title: 'Mobile phone usage while driving',
        description: 'Driver visibly handling phone or texting while in motion.',
      },
      {
        code: 'excessive_speeding',
        title: 'High speed in residential or school zone',
        description: 'Travelling significantly over safe speed limit in pedestrian area.',
      },
      {
        code: 'aggressive_undertaking',
        title: 'Aggressive cutting off / overtaking',
        description: 'Abruptly swerving in front of other vehicles without clearance.',
      },
      {
        code: 'failure_to_indicate',
        title: 'Failing to indicate at junction / roundabout',
        description: 'Turning or changing lanes with no indicator signal given.',
      },
      {
        code: 'other_driver_behaviour',
        title: 'Other driving behaviour issue',
        description: 'Another observed unsafe driving action not listed above.',
      },
    ],
  },
  {
    id: 'road_violation',
    title: 'Road-use violation',
    subtitle: 'Traffic and parking offences',
    iconName: 'road-line',
    issues: [
      {
        code: 'blocking_driveway_kerb',
        title: 'Blocking driveway or dropped kerb',
        description: 'Parked across private access or disabled dropped kerb ramp.',
      },
      {
        code: 'bus_cycle_lane_blocked',
        title: 'Obstruction in bus or cycle lane',
        description: 'Parked or driving in designated cycle track or bus route.',
      },
      {
        code: 'ran_red_light',
        title: 'Ran red traffic light',
        description: 'Proceeded across junction after traffic signal turned red.',
      },
      {
        code: 'double_parking',
        title: 'Double parking / blocking roadway',
        description: 'Parked parallel to another vehicle preventing traffic flow.',
      },
      {
        code: 'parked_on_blind_bend',
        title: 'Hazardous parking on bend or brow of hill',
        description: 'Stationary vehicle causing severe blind spot for oncoming traffic.',
      },
      {
        code: 'other_road_violation',
        title: 'Other road-use or parking offence',
        description: 'Another traffic or parking issue not listed above.',
      },
    ],
  },
];
