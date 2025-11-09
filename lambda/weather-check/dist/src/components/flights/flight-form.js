"use strict";
/**
 * @fileoverview Flight booking form component
 * @module components/flights/flight-form
 */
'use client';
/**
 * @fileoverview Flight booking form component
 * @module components/flights/flight-form
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightForm = FlightForm;
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const select_1 = require("@/components/ui/select");
const flight_schemas_1 = require("@/server/schemas/flight-schemas");
const trpc_1 = require("@/lib/trpc");
const navigation_1 = require("next/navigation");
const use_toast_1 = require("@/hooks/use-toast");
const react_1 = require("react");
const airport_select_1 = require("./airport-select");
/**
 * Flight booking form with validation
 *
 * @param props - Component props
 * @returns Rendered flight form
 */
function FlightForm({ defaultStudentId, defaultInstructorId, instructors = [], onSuccess, }) {
    const router = (0, navigation_1.useRouter)();
    const { toast } = (0, use_toast_1.useToast)();
    const utils = trpc_1.trpc.useUtils();
    const [selectedInstructor, setSelectedInstructor] = (0, react_1.useState)(defaultInstructorId || '');
    const defaultLocation = {
        name: 'KJFK - John F. Kennedy International',
        latitude: 40.6413,
        longitude: -73.7781,
        icaoCode: 'KJFK',
    };
    const [selectedDepartureLocation, setSelectedDepartureLocation] = (0, react_1.useState)(defaultLocation);
    const { register, handleSubmit, formState: { errors }, setValue, watch, } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(flight_schemas_1.createFlightSchema),
        defaultValues: {
            instructorId: defaultInstructorId || '',
            trainingLevel: 'STUDENT',
            duration: 1.5,
            departureLocation: {
                name: 'KJFK - John F. Kennedy International',
                latitude: 40.6413,
                longitude: -73.7781,
                icaoCode: 'KJFK',
            },
        },
    });
    // Register instructorId field
    register('instructorId');
    const createFlight = trpc_1.trpc.flights.create.useMutation({
        onSuccess: () => {
            // Invalidate flights list query to refresh dashboard
            utils.flights.list.invalidate();
            toast({
                title: 'Flight created',
                description: 'Your flight booking has been created successfully.',
            });
            if (onSuccess) {
                onSuccess();
            }
            else {
                router.push('/dashboard');
                router.refresh(); // Refresh server components
            }
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create flight booking.',
                variant: 'destructive',
            });
        },
    });
    const onSubmit = async (data) => {
        // Use selected airport location
        if (selectedDepartureLocation) {
            data.departureLocation = selectedDepartureLocation;
        }
        else {
            // Default to JFK if no location selected
            data.departureLocation = {
                name: 'KJFK - John F. Kennedy International',
                latitude: 40.6413,
                longitude: -73.7781,
                icaoCode: 'KJFK',
            };
        }
        // Ensure instructor ID is set
        if (!data.instructorId && selectedInstructor) {
            data.instructorId = selectedInstructor;
        }
        // studentId is handled server-side from the authenticated session
        createFlight.mutate(data);
    };
    return (<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label_1.Label htmlFor="scheduledDate">Scheduled Date & Time</label_1.Label>
          <input_1.Input id="scheduledDate" type="datetime-local" {...register('scheduledDate', { valueAsDate: true })} className={errors.scheduledDate ? 'border-destructive' : ''}/>
          {errors.scheduledDate && (<p className="text-sm text-destructive">{errors.scheduledDate.message}</p>)}
        </div>

        <div className="space-y-2">
          <label_1.Label htmlFor="trainingLevel">Training Level</label_1.Label>
          <select_1.Select onValueChange={(value) => setValue('trainingLevel', value)} defaultValue="STUDENT">
            <select_1.SelectTrigger>
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="STUDENT">Student Pilot</select_1.SelectItem>
              <select_1.SelectItem value="PRIVATE">Private Pilot</select_1.SelectItem>
              <select_1.SelectItem value="INSTRUMENT">Instrument Rated</select_1.SelectItem>
              <select_1.SelectItem value="COMMERCIAL">Commercial Pilot</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>

        <div className="space-y-2">
          <label_1.Label htmlFor="instructorId">Instructor</label_1.Label>
          {instructors.length > 0 ? (<select_1.Select onValueChange={(value) => {
                setSelectedInstructor(value);
                setValue('instructorId', value);
            }} value={selectedInstructor}>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Select instructor"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {instructors.map((instructor) => (<select_1.SelectItem key={instructor.id} value={instructor.id}>
                    {instructor.name || instructor.email}
                  </select_1.SelectItem>))}
              </select_1.SelectContent>
            </select_1.Select>) : (<input_1.Input id="instructorId" {...register('instructorId')} placeholder="Instructor ID" className={errors.instructorId ? 'border-destructive' : ''}/>)}
          {errors.instructorId && (<p className="text-sm text-destructive">{errors.instructorId.message}</p>)}
        </div>

        <div className="space-y-2">
          <label_1.Label htmlFor="duration">Duration (hours)</label_1.Label>
          <input_1.Input id="duration" type="number" step="0.5" min="0.5" max="10" {...register('duration', { valueAsNumber: true })} className={errors.duration ? 'border-destructive' : ''}/>
          {errors.duration && (<p className="text-sm text-destructive">{errors.duration.message}</p>)}
        </div>
      </div>

      <airport_select_1.AirportSelect label="Departure Location" value={selectedDepartureLocation} onChange={(location) => {
            setSelectedDepartureLocation(location);
            if (location) {
                setValue('departureLocation', location);
            }
        }} error={errors.departureLocation?.message} placeholder="Search by airport code (e.g., KJFK) or name..."/>

      <div className="space-y-2">
        <label_1.Label htmlFor="notes">Notes (optional)</label_1.Label>
        <textarea_1.Textarea id="notes" {...register('notes')} placeholder="Additional notes about this flight..." rows={3}/>
      </div>

      <div className="flex gap-2">
        <button_1.Button type="submit" disabled={createFlight.isPending}>
          {createFlight.isPending ? 'Creating...' : 'Create Flight'}
        </button_1.Button>
      </div>
    </form>);
}
