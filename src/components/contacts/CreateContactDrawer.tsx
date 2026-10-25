import { useState } from "react";
import { Box, Button, Stack, Alert, CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { SideDrawer } from "@/components/common/SideDrawer";
import { FormTextField } from "@/components/forms/FormTextField";
import { getErrorMessage } from "@/api/client";
import { contactsService } from "@/api/services";
import type { CreateContactDto } from "@/types";

interface CreateContactDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function CreateContactDrawer({
  open,
  onClose,
  onSuccess,
}: CreateContactDrawerProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const { control, handleSubmit, reset } = useForm<CreateContactDto>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      alternatePhone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateContactDto) => contactsService.create(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["contacts"],
      });

      onSuccess("Contact added successfully.");
      reset();
      setError("");
      onClose();
    },

    onError: (err: unknown) => {
      setError(getErrorMessage(err));
    },
  });

  const handleClose = () => {
    if (createMutation.isPending) return;

    reset();
    setError("");
    onClose();
  };

  const onSubmit = (data: CreateContactDto) => {
    setError("");

    const payload: CreateContactDto = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || undefined,
      alternatePhone: data.alternatePhone?.trim() || undefined,
      address: data.address?.trim() || undefined,
      city: data.city?.trim() || undefined,
      state: data.state?.trim() || undefined,
      pincode: data.pincode?.trim() || undefined,
    };

    createMutation.mutate(payload);
  };

  return (
    <SideDrawer
      open={open}
      onClose={handleClose}
      title="Add Contact"
      subtitle="Create a new contact manually"
      width={520}
      footer={
        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={!open || createMutation.isPending}
            startIcon={
              createMutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {createMutation.isPending ? "Saving..." : "Save Contact"}
          </Button>
        </Box>
      }
    >
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <FormTextField
          name="firstName"
          control={control}
          label="First Name"
          required
        />

        <FormTextField
          name="lastName"
          control={control}
          label="Last Name"
          required
        />

        <FormTextField name="phone" control={control} label="Phone" required />

        <FormTextField
          name="email"
          control={control}
          label="Email"
          type="email"
        />

        <FormTextField
          name="alternatePhone"
          control={control}
          label="Alternate Phone"
        />

        <FormTextField
          name="address"
          control={control}
          label="Address"
          multiline
          rows={2}
        />

        <FormTextField name="city" control={control} label="City" />

        <FormTextField name="state" control={control} label="State" />

        <FormTextField name="pincode" control={control} label="Pincode" />
      </Stack>
    </SideDrawer>
  );
}
