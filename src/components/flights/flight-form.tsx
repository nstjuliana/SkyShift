/**
 * @fileoverview Flight booking form component
 * @module components/flights/flight-form
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createFlightSchema, type CreateFlightInput } from '@/server/schemas/flight-schemas';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import type { TrainingLevel } from '@prisma/client';
import { AirportSelect } from './airport-select';
import type { Location } from '@/types/flight';

/**
 * Props for FlightForm component
 */
interface FlightFormProps {
  /** Default student ID (from session) */
  defaultStudentId: string;
  /** Default instructor ID (optional) */
  defaultInstructorId?: string;
  /** List of available instructors */
  instructors?: Array<{ id: string; name: string | null; email: string }>;
  /** Callback when form is submitted successfully */
  onSuccess?: () => void;
}

/**
 * Flight booking form with validation
 * 
 * @param props - Component props
 * @returns Rendered flight form
 */
export function FlightForm({
  defaultStudentId,
  defaultInstructorId,
  instructors = [],
  onSuccess,
}: FlightFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const [selectedInstructor, setSelectedInstructor] = useState(defaultInstructorId || '');
  const defaultLocation: Location = {
    name: 'KJFK - John F. Kennedy International',
    latitude: 40.6413,
    longitude: -73.7781,
    icaoCode: 'KJFK',
  };
  const [selectedDepartureLocation, setSelectedDepartureLocation] = useState<Location | null>(defaultLocation);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateFlightInput>({
    resolver: zodResolver(createFlightSchema),
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

  const createFlight = trpc.flights.create.useMutation({
    onSuccess: () => {
      // Invalidate flights list query to refresh dashboard
      utils.flights.list.invalidate();
      
      toast({
        title: 'Flight created',
        description: 'Your flight booking has been created successfully.',
      });
      if (onSuccess) {
        onSuccess();
      } else {
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

  const onSubmit = async (data: CreateFlightInput) => {
    // Use selected airport location
    if (selectedDepartureLocation) {
      data.departureLocation = selectedDepartureLocation;
    } else {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="scheduledDate">Scheduled Date & Time</Label>
          <Input
            id="scheduledDate"
            type="datetime-local"
            {...register('scheduledDate', { valueAsDate: true })}
            className={errors.scheduledDate ? 'border-destructive' : ''}
          />
          {errors.scheduledDate && (
            <p className="text-sm text-destructive">{errors.scheduledDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="trainingLevel">Training Level</Label>
          <Select
            onValueChange={(value) => setValue('trainingLevel', value as TrainingLevel)}
            defaultValue="STUDENT"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STUDENT">Student Pilot</SelectItem>
              <SelectItem value="PRIVATE">Private Pilot</SelectItem>
              <SelectItem value="INSTRUMENT">Instrument Rated</SelectItem>
              <SelectItem value="COMMERCIAL">Commercial Pilot</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructorId">Instructor</Label>
          {instructors.length > 0 ? (
            <Select
              onValueChange={(value) => {
                setSelectedInstructor(value);
                setValue('instructorId', value);
              }}
              value={selectedInstructor}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select instructor" />
              </SelectTrigger>
              <SelectContent>
                {instructors.map((instructor) => (
                  <SelectItem key={instructor.id} value={instructor.id}>
                    {instructor.name || instructor.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="instructorId"
              {...register('instructorId')}
              placeholder="Instructor ID"
              className={errors.instructorId ? 'border-destructive' : ''}
            />
          )}
          {errors.instructorId && (
            <p className="text-sm text-destructive">{errors.instructorId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration (hours)</Label>
          <Input
            id="duration"
            type="number"
            step="0.5"
            min="0.5"
            max="10"
            {...register('duration', { valueAsNumber: true })}
            className={errors.duration ? 'border-destructive' : ''}
          />
          {errors.duration && (
            <p className="text-sm text-destructive">{errors.duration.message}</p>
          )}
        </div>
      </div>

      <AirportSelect
        label="Departure Location"
        value={selectedDepartureLocation}
        onChange={(location) => {
          setSelectedDepartureLocation(location);
          if (location) {
            setValue('departureLocation', location);
          }
        }}
        error={errors.departureLocation?.message}
        placeholder="Search by airport code (e.g., KJFK) or name..."
      />

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Additional notes about this flight..."
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={createFlight.isPending}>
          {createFlight.isPending ? 'Creating...' : 'Create Flight'}
        </Button>
      </div>
    </form>
  );
}

