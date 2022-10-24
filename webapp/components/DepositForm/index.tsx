/*
 * Copyright 2022 Phillip Gates-Shannon. All rights reserved. Licensed under the Open Software License version 3.0.
 */

import {
  Group,
  NativeSelect,
  NumberInput,
  Table,
  TextInput,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useForm, yupResolver } from '@mantine/form';
import { FC, PropsWithChildren, SyntheticEvent } from 'react';

import { CategoryValues } from '../../client-lib/types';
import { newTransactionSchema } from '../../shared-lib';

interface Props extends PropsWithChildren {
  accounts: { label: string; value: string }[];
  categories: CategoryValues[];
}

export const DepositForm: FC<Props> = (props) => {
  const initialAmounts = props.categories.reduce((output, current) => {
    return {
      ...output,
      [current.id]: {
        amount: 0,
        categoryId: current.id,
      },
    };
  }, {});

  const form = useForm({
    initialValues: {
      amounts: initialAmounts,
      accountId: props.accounts[0].value,
      date: new Date(),
      description: '',
    },
    validate: yupResolver(newTransactionSchema),
    validateInputOnChange: true,
  });

  function handleCategoryChangeFactory(defaultChangeHandler: (e: SyntheticEvent) => void) {
    return function handleCategoryChange(e: SyntheticEvent) {
      defaultChangeHandler(e);
    }
  }

  const rows = props.categories.map((row) => {
    let input = null;
    if (row.isLeaf) {
      const { onChange, ...inputProps } = form.getInputProps(`amounts.${row.id}.amount`)
      input = <NumberInput
        decimalSeparator="."
        hideControls
        precision={2}
        onChange={handleCategoryChangeFactory(onChange)}
        {...inputProps}
      />
    }
    return (
      <tr key={row.id}>
        <td style={{ paddingLeft: 10 + 16 * row.depth }}>{row.label}</td>
        <td>{row.balance}</td>
        <td>{input}</td>
      </tr>
    );
  });

  return (
    <form
      onSubmit={form.onSubmit(
        (values) => console.log(values),
        (values) => console.error(values)
      )}
    >
      <DatePicker
        allowFreeInput
        inputFormat="YYYY-MM-DD"
        label="Date"
        my="sm"
        required
        {
          // I really dislike this syntax; it's too much magic
          ...form.getInputProps('date')
        }
      />
      <TextInput
        label="Description"
        placeholder="Payer"
        my="sm"
        required
        {...form.getInputProps('description')}
      />
      <NativeSelect
        data={props.accounts}
        label="Account"
        my="sm"
        required
        {...form.getInputProps('accountId')}
      />
      <Group position="apart">
        <NumberInput
          decimalSeparator="."
          hideControls
          label="Total Amount"
          my="sm"
          precision={2}
          required
          style={{ width: '45%' }}
          {...form.getInputProps('totalAmount')}
        />
        <NumberInput
          decimalSeparator="."
          disabled
          hideControls
          label="Amount Remaining"
          my="sm"
          precision={2}
          style={{ width: '45%' }}
          value={0}
        />
      </Group>
      <Table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Current Balance</th>
            <th>Deposit Amount</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </form>
  );
};
