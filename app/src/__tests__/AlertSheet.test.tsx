import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { AlertSheet } from '../shared/components/AlertSheet';
import { CancelGameSheet } from '../shared/components/CancelGameSheet';

describe('AlertSheet', () => {
  const baseProps = {
    visible: true,
    children: <Text>Corps du message</Text>,
    confirmLabel: <Text>OUI</Text>,
    cancelLabel: <Text>NON</Text>,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('appelle onConfirm quand le bouton de confirmation est pressé', () => {
    render(<AlertSheet {...baseProps} />);
    fireEvent.press(screen.getByTestId('alert-sheet-confirm'));
    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('appelle onCancel quand le bouton d\'annulation est pressé', () => {
    render(<AlertSheet {...baseProps} />);
    fireEvent.press(screen.getByTestId('alert-sheet-cancel'));
    expect(baseProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('affiche le contenu enfant', () => {
    render(<AlertSheet {...baseProps} />);
    expect(screen.getByText('Corps du message')).toBeTruthy();
  });
});

describe('CancelGameSheet', () => {
  const baseProps = {
    visible: true,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le titre et le texte avec highlight', () => {
    render(<CancelGameSheet {...baseProps} />);
    expect(screen.getByText('Etes-vous sûr ?')).toBeTruthy();
    expect(screen.getByText('sera perdue')).toBeTruthy();
  });

  it('appelle onConfirm quand OUI est pressé', () => {
    render(<CancelGameSheet {...baseProps} />);
    fireEvent.press(screen.getByTestId('alert-sheet-confirm'));
    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('appelle onCancel quand NON est pressé', () => {
    render(<CancelGameSheet {...baseProps} />);
    fireEvent.press(screen.getByTestId('alert-sheet-cancel'));
    expect(baseProps.onCancel).toHaveBeenCalledTimes(1);
  });
});
