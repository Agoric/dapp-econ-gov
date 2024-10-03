import '../../src/installSesLockdown';
import { test, expect, describe, vi } from 'vitest';

vi.stubGlobal('window', {
  location: { search: '' },
  alert: vi.fn(),
  keplr: {
    experimentalSuggestChain: vi.fn(),
    enable: vi.fn(),
    getKey: () => ({ isNanoLedger: true }),
    getOfflineSignerOnlyAmino: () => ({
      getAccounts: () => [{ address: 1 }],
    }),
  },
});

import { inferInvitationStatus } from './wallet';
import { LoadStatus } from './rpc';

const createMockWallet = ({
  usedCharterInviations = 0,
  charterInvitations = 0,
  usedCommitteeInvitations = 0,
  committeeInvitations = 0,
}) => ({
  brands: [],
  liveOffers: [],
  offerToPublicSubscriberPaths: [],
  offerToUsedInvitation: [
    ...[...Array(usedCharterInviations)].map((_, idx) => [
      `econgov-${1_000_000 + idx}`,
      {
        brand: 'Zoe Invitation Brand',
        value: [
          {
            description: 'charter member invitation',
            handle: null,
            installation: null,
            instance: `instance${idx}`,
          },
        ],
      },
    ]),
    ...[...Array(usedCommitteeInvitations)].map((_, idx) => [
      `econgov-${2_000_000 + idx}`,
      {
        brand: 'Zoe Invitation Brand',
        value: [
          {
            description: 'Voter0',
            handle: null,
            installation: null,
            instance: `instance${idx}`,
          },
        ],
      },
    ]),
  ],
  purses: [
    {
      balance: {
        brand: 'Zoe Invitation Brand',
        value: [
          ...[...Array(charterInvitations)].map((_, idx) => ({
            description: 'charter member invitation',
            handle: null,
            installation: null,
            instance: `instance${idx}`,
          })),
          ...[...Array(committeeInvitations)].map((_, idx) => ({
            description: 'Voter0',
            handle: null,
            installation: null,
            instance: `instance${idx}`,
          })),
        ],
      },
      brand: 'Zoe Invitation Brand',
    },
  ],
});

describe('inferInvitationStatus', () => {
  test('should find one accepted charter and committee invitation', () => {
    const mockWallet = createMockWallet({
      usedCharterInviations: 1,
      usedCommitteeInvitations: 1,
    });

    const charterInvitationStatus = inferInvitationStatus(
      LoadStatus.Received,
      mockWallet,
      'charter member invitation',
      'instance0',
    );

    const voterInvitationStatus = inferInvitationStatus(
      LoadStatus.Received,
      mockWallet,
      'Voter',
      'instance0',
    );

    expect(charterInvitationStatus).toStrictEqual({
      acceptedIn: 'econgov-1000000',
      status: 'accepted',
    });

    expect(voterInvitationStatus).toStrictEqual({
      acceptedIn: 'econgov-2000000',
      status: 'accepted',
    });
  });

  test('should not find any accepted charter and committee invitation', () => {
    const mockWallet = createMockWallet({});

    const charterInvitationStatus = inferInvitationStatus(
      LoadStatus.Received,
      mockWallet,
      'charter member invitation',
      'instance0',
    );

    const voterInvitationStatus = inferInvitationStatus(
      LoadStatus.Received,
      mockWallet,
      'Voter',
      'instance0',
    );

    expect(charterInvitationStatus).toStrictEqual({
      status: 'missing',
    });

    expect(voterInvitationStatus).toStrictEqual({
      status: 'missing',
    });
  });

  test('should find unused charter and committee invitation', () => {
    const mockWallet = createMockWallet({
      charterInvitations: 1,
      committeeInvitations: 1,
    });

    const charterInvitationStatus = inferInvitationStatus(
      LoadStatus.Received,
      mockWallet,
      'charter member invitation',
      'instance0',
    );

    const voterInvitationStatus = inferInvitationStatus(
      LoadStatus.Received,
      mockWallet,
      'Voter',
      'instance0',
    );

    expect(charterInvitationStatus).toStrictEqual({
      invitation: {
        description: 'charter member invitation',
        handle: null,
        installation: null,
        instance: 'instance0',
      },
      status: 'available',
    });

    expect(voterInvitationStatus).toStrictEqual({
      invitation: {
        description: 'Voter0',
        handle: null,
        installation: null,
        instance: 'instance0',
      },
      status: 'available',
    });
  });

  test('should find new unused invitations before old used ones', () => {
    const mockWallet = createMockWallet({
      charterInvitations: 2,
      committeeInvitations: 2,
      usedCharterInviations: 1,
      usedCommitteeInvitations: 1,
    });

    const charterInvitationStatus = inferInvitationStatus(
      LoadStatus.Received,
      mockWallet,
      'charter member invitation',
      'instance1',
    );

    const voterInvitationStatus = inferInvitationStatus(
      LoadStatus.Received,
      mockWallet,
      'Voter',
      'instance1',
    );

    expect(charterInvitationStatus).toStrictEqual({
      invitation: {
        description: 'charter member invitation',
        handle: null,
        installation: null,
        instance: 'instance1',
      },
      status: 'available',
    });

    expect(voterInvitationStatus).toStrictEqual({
      invitation: {
        description: 'Voter0',
        handle: null,
        installation: null,
        instance: 'instance1',
      },
      status: 'available',
    });
  });

  test('should find newer used charter and committee invitation before old ones', () => {
    const mockWallet = createMockWallet({
      usedCharterInviations: 2,
      usedCommitteeInvitations: 2,
    });

    const charterInvitationStatus = inferInvitationStatus(
      LoadStatus.Received,
      mockWallet,
      'charter member invitation',
      'instance1',
    );

    const voterInvitationStatus = inferInvitationStatus(
      LoadStatus.Received,
      mockWallet,
      'Voter',
      'instance1',
    );

    // newer invitations will have the last digit as 1
    expect(charterInvitationStatus).toStrictEqual({
      acceptedIn: 'econgov-1000001',
      status: 'accepted',
    });

    expect(voterInvitationStatus).toStrictEqual({
      acceptedIn: 'econgov-2000001',
      status: 'accepted',
    });
  });

  test('should not find old charter and committee invitation (used or unused) when new instance is available', () => {
    const mockWallet = createMockWallet({
      charterInvitations: 1,
      committeeInvitations: 1,
      usedCharterInviations: 1,
      usedCommitteeInvitations: 1,
    });

    const charterInvitationStatus = inferInvitationStatus(
      LoadStatus.Received,
      mockWallet,
      'charter member invitation',
      'instance1',
    );

    const voterInvitationStatus = inferInvitationStatus(
      LoadStatus.Received,
      mockWallet,
      'Voter',
      'instance1',
    );

    // newer invitations will have the last digit as 1
    expect(charterInvitationStatus).toStrictEqual({
      status: 'missing',
    });

    expect(voterInvitationStatus).toStrictEqual({
      status: 'missing',
    });
  });
});
