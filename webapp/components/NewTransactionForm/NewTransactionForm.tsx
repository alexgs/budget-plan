/*
 * Copyright 2022 Phillip Gates-Shannon. All rights reserved. Licensed under the Open Software License version 3.0.
 */

import { useForm, yupResolver } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { FC } from 'react';
import { formatClientDate } from '../../client-lib';
import {
  CategoryValues,
  NewTransactionFormHook,
  NewTransactionFormValues,
} from '../../client-lib/types';
import { newTransactionSchema } from '../../shared-lib';
import { SinglePaymentForm } from './SinglePaymentForm';
import { SplitPaymentForm } from './SplitPaymentForm';

interface Props {
  accounts: { value: string; label: string }[];
  categories: CategoryValues[];
}

export const NewTransactionForm: FC<Props> = (props) => {
  const form: NewTransactionFormHook = useForm({
    initialValues: {
      amounts: [
        {
          accountId: props.accounts[0].value,
          amount: 0,
          categoryId: props.categories[0].id,
          isCredit: false as boolean,
          status: 'pending',
        },
      ],
      balance: 0, // Client-only field
      date: new Date(),
      description: '',
      isCredit: false as boolean, // Client-only field
      type: 'payment',
    },
    validate: yupResolver(newTransactionSchema),
    validateInputOnChange: true,
  });

  function handleSplitClick() {
    form.insertListItem('amounts', {
      accountId: props.accounts[0].value,
      amount: 0,
      categoryId: props.categories[0].id,
      isCredit: false,
      notes: '',
      status: 'pending',
    });
  }

  function handleSubmit(values: NewTransactionFormValues) {
    // TODO Display a loading modal
    void requestPostTransaction(values);
  }

  async function requestPostTransaction(values: NewTransactionFormValues) {
    const { balance, isCredit, ...record } = values;
    const amounts = record.amounts.map((amount) => ({
      ...amount,
      amount: amount.amount * 100,
    }));
    const payload = {
      ...record,
      amounts,
      date: formatClientDate(record.date),
    };

    const responseData = await fetch('/api/transactions', {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
      .then((response) => response.json())
      .catch((e) => {
        console.error(e);
        showNotification({
          color: 'red',
          message: 'Something went wrong! Please check the logs.',
          title: 'Error',
        });
      });

    showNotification({
      message: `Saved deposit "${responseData.description}"`,
      title: 'Success',
    });
  }

  const categoriesData = props.categories
    .filter((cat) => cat.isLeaf)
    .map((cat) => ({
      value: cat.id,
      label: cat.label,
    }));

  if (form.values.amounts.length === 1) {
    return (
      <SinglePaymentForm
        accounts={props.accounts}
        categories={categoriesData}
        mantineForm={form}
        onSplitClick={handleSplitClick}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <SplitPaymentForm
      accounts={props.accounts}
      categories={categoriesData}
      mantineForm={form}
      onSplitClick={handleSplitClick}
      onSubmit={handleSubmit}
    />
  );
};