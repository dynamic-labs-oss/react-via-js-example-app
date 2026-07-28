import { type Chain, refreshAuth } from '@dynamic-labs-sdk/client';
import {
  type BusinessAccount,
  type BusinessAccountDetail,
  type BusinessAccountMember,
  type BusinessAccountSigner,
  type BusinessAccountWalletSummary,
  addBusinessAccountMember,
  addBusinessAccountSigner,
  addWalletToBusinessAccount,
  createBusinessAccount,
  createWalletForBusinessAccount,
  getBusinessAccount,
  listBusinessAccounts,
  removeBusinessAccountMember,
  removeBusinessAccountSigner,
  transferBusinessAccountOwnership,
} from '@dynamic-labs-sdk/client/waas';
import { useGetWalletAccounts, useUser } from '@dynamic-labs-sdk/react-hooks';
import { Building2, ChevronDown, Plus, Wallet } from 'lucide-react';
import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/utils/cn';

type WalletAcct = {
  address: string;
  chain: string;
  id: string;
  verifiedCredentialId?: string | null;
} & Record<string, unknown>;

type SignerIdentifyBy = 'email' | 'userId';
type MemberIdentifyBy = 'email' | 'userId';
type AssignableMemberRole = 'admin' | 'viewer';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CARD = 'rounded-2xl bg-card border border-border/60 shadow-card';
const MONO = 'font-mono text-xs text-muted-foreground break-all';
const AVATAR =
  'w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center flex-shrink-0 text-[11px] font-semibold text-muted-foreground';
const PILL =
  'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset whitespace-nowrap';
const PILL_BRAND = 'bg-brand/10 text-brand ring-brand/30';
const PILL_NEUTRAL = 'bg-muted/60 text-muted-foreground ring-border';
const PILL_YOU = 'bg-primary/10 text-primary ring-primary/20';
const PILL_ACTIVE = 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20';
const PILL_PENDING = 'bg-amber-500/10 text-amber-600 ring-amber-500/20';

const short = (value?: string) =>
  value ? `${value.slice(0, 6)}…${value.slice(-4)}` : '—';

const initials = (value?: string | null) =>
  value
    ? value
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 2)
        .toUpperCase()
    : '—';

export const BusinessAccountsRoute: FC = () => {
  const { data: walletAccounts = [] } = useGetWalletAccounts();
  const personalWallets = walletAccounts as unknown as WalletAcct[];

  const { data: user } = useUser();
  const currentUserId = user?.id;

  const enabledChainNames = useMemo(() => {
    const chains = Array.from(
      new Set(personalWallets.map((wallet) => wallet.chain).filter(Boolean))
    );
    return chains.length > 0 ? chains : ['EVM'];
  }, [personalWallets]);

  const [name, setName] = useState('');
  const [accounts, setAccounts] = useState<BusinessAccount[]>([]);
  const [accountsLoaded, setAccountsLoaded] = useState(false);
  const [businessId, setBusinessId] = useState('');
  const [detail, setDetail] = useState<BusinessAccountDetail | undefined>();
  const [createOpen, setCreateOpen] = useState(false);

  const [memberUserId, setMemberUserId] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberIdentifyBy, setMemberIdentifyBy] =
    useState<MemberIdentifyBy>('email');
  const [memberRole, setMemberRole] = useState<AssignableMemberRole>('viewer');

  const [createChain, setCreateChain] = useState('');

  const [linkModalOpen, setLinkModalOpen] = useState(false);

  const [signerTargetWallet, setSignerTargetWallet] = useState<
    BusinessAccountWalletSummary | undefined
  >();
  const [signerModalOpen, setSignerModalOpen] = useState(false);
  const [signerIdentifyBy, setSignerIdentifyBy] =
    useState<SignerIdentifyBy>('email');
  const [signerEmail, setSignerEmail] = useState('');
  const [signerUserId, setSignerUserId] = useState('');

  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [convertWallet, setConvertWallet] = useState<WalletAcct | undefined>();

  const [busy, setBusy] = useState<string | undefined>();
  const [result, setResult] = useState<string | undefined>();
  const [showResult, setShowResult] = useState(false);

  const effectiveCreateChain = createChain || enabledChainNames[0] || '';

  const loadDetail = async ({ id }: { id: string }) => {
    const loaded = await getBusinessAccount({ businessAccountId: id });
    setBusinessId(id);
    setDetail(loaded);
    return loaded;
  };

  const run = async ({
    label,
    action,
    refresh = false,
    successMessage,
    errorMessage = 'Something went wrong',
  }: {
    action: () => Promise<unknown>;
    errorMessage?: string;
    label: string;
    refresh?: boolean;
    successMessage?: string;
  }) => {
    setBusy(label);
    try {
      const value = await action();
      setResult(JSON.stringify(value, null, 2));
      if (successMessage) toast.success(successMessage);
      if (refresh && businessId) {
        try {
          await loadDetail({ id: businessId });
        } catch {
          // Detail refresh is best-effort; the action itself succeeded.
        }
      }
      return value;
    } catch (caught) {
      toast.error(errorMessage, {
        description: caught instanceof Error ? caught.message : String(caught),
      });
      return undefined;
    } finally {
      setBusy(undefined);
    }
  };

  const loadAccounts = async ({ selectId }: { selectId?: string } = {}) => {
    setBusy('accounts');
    try {
      const list = await listBusinessAccounts();
      const items = list?.items ?? [];
      setAccounts(items);
      const toSelect = selectId ?? (businessId || items[0]?.id);
      if (toSelect) {
        try {
          await loadDetail({ id: toSelect });
        } catch {
          // Selecting is best-effort; the list still renders.
        }
      }
    } catch (caught) {
      toast.error('Failed to load business accounts', {
        description: caught instanceof Error ? caught.message : String(caught),
      });
    } finally {
      setAccountsLoaded(true);
      setBusy(undefined);
    }
  };

  useEffect(() => {
    void refreshAuth().then(() => loadAccounts());
  }, []);

  const openCreateModal = () => {
    setName('');
    setCreateOpen(true);
  };

  const handleCreateAccount = async () => {
    setBusy('create');
    try {
      const account = await createBusinessAccount({ name: name || undefined });
      setResult(JSON.stringify(account, null, 2));
      toast.success('Business account created');
      setName('');
      setCreateOpen(false);
      await loadAccounts({ selectId: account?.id });
    } catch (caught) {
      toast.error('Failed to create business account', {
        description: caught instanceof Error ? caught.message : String(caught),
      });
    } finally {
      setBusy(undefined);
    }
  };

  const selectAccount = ({ id }: { id: string }) =>
    run({ action: () => loadDetail({ id }), label: 'load' });

  const handleCreateWallet = () =>
    run({
      action: async () => {
        const created = await createWalletForBusinessAccount({
          businessAccountId: businessId,
          chain: effectiveCreateChain as Chain,
        });
        // The new wallet must land in this session's wallet accounts before it
        // can be signed/reshared from, so refresh the cached user.
        await refreshAuth();
        return created;
      },
      errorMessage: 'Failed to create wallet',
      label: 'wallet',
      refresh: true,
      successMessage: 'Wallet created',
    });

  const handleLinkWallet = async ({ walletId }: { walletId: string }) => {
    const value = await run({
      action: () =>
        addWalletToBusinessAccount({ businessAccountId: businessId, walletId }),
      errorMessage: 'Failed to link wallet',
      label: 'link',
      refresh: true,
      successMessage: 'Wallet linked',
    });
    if (value) setLinkModalOpen(false);
  };

  const handleAddMember = async () => {
    if (memberIdentifyBy === 'email' && !EMAIL_REGEX.test(memberEmail)) {
      toast.error('Enter a valid email address.');
      return;
    }
    if (memberIdentifyBy === 'userId' && !memberUserId.trim()) {
      toast.error('Enter a user ID.');
      return;
    }
    const value = await run({
      action: () =>
        addBusinessAccountMember({
          businessAccountId: businessId,
          role: memberRole,
          ...(memberIdentifyBy === 'email'
            ? { identifier: memberEmail, identifierType: 'email' }
            : { userId: memberUserId }),
        }),
      errorMessage: 'Failed to add member',
      label: 'member',
      refresh: true,
      successMessage: 'Member added',
    });
    if (value) {
      setMemberUserId('');
      setMemberEmail('');
    }
  };

  const openSignerModal = ({
    wallet,
  }: {
    wallet: BusinessAccountWalletSummary;
  }) => {
    // Signer-derived fallback wallets carry only an id; without an address the
    // reshare can't run.
    if (!wallet.publicKey || !wallet.chain) {
      toast.error(
        'This wallet is missing its address/chain, so a signer cannot be added to it here.'
      );
      return;
    }
    // Fields are shared with the convert dialog — clear so stale input from a
    // cancelled entry can't be submitted.
    setSignerEmail('');
    setSignerUserId('');
    setSignerTargetWallet(wallet);
    setSignerModalOpen(true);
  };

  const handleAddSigner = async () => {
    if (!signerTargetWallet) return;
    const value = await run({
      action: () =>
        addBusinessAccountSigner({
          businessAccountId: businessId,
          targetSignerIdentity:
            signerIdentifyBy === 'email'
              ? { identifier: signerEmail, identifierType: 'email' }
              : { userId: signerUserId },
          // The SDK resolves the WaaS provider by chain and reshares using the
          // wallet address, so the BA wallet's chain + publicKey is all it
          // needs — no lookup in this session's getWalletAccounts() required.
          walletAccount: {
            address: signerTargetWallet.publicKey,
            chain: signerTargetWallet.chain,
          } as never,
        }),
      errorMessage: 'Failed to add signer',
      label: 'signer',
      refresh: true,
      successMessage: 'Signer added',
    });
    if (value) {
      setSignerModalOpen(false);
      setSignerEmail('');
      setSignerUserId('');
    }
  };

  const handleRemoveSigner = ({ signer }: { signer: BusinessAccountSigner }) =>
    run({
      action: () =>
        removeBusinessAccountSigner({
          businessAccountId: signer.businessAccountId || businessId,
          signerId: signer.id,
          walletId: signer.walletId,
        }),
      errorMessage: 'Failed to remove signer',
      label: `removeSigner:${signer.id}`,
      refresh: true,
      successMessage: 'Signer removed',
    });

  const handleRemoveMember = ({ member }: { member: BusinessAccountMember }) =>
    run({
      action: () =>
        removeBusinessAccountMember({
          businessAccountId: member.businessAccountId || businessId,
          userId: member.userId,
        }),
      errorMessage: 'Failed to remove member',
      label: `removeMember:${member.userId}`,
      refresh: true,
      successMessage: 'Member removed',
    });

  const handleTransferOwnership = ({
    member,
  }: {
    member: BusinessAccountMember;
  }) =>
    run({
      action: () =>
        transferBusinessAccountOwnership({
          businessAccountId: member.businessAccountId || businessId,
          newOwnerUserId: member.userId,
        }),
      errorMessage: 'Failed to transfer ownership',
      label: `transfer:${member.userId}`,
      refresh: true,
      successMessage: 'Ownership transferred',
    });

  const openConvertModal = () => {
    setConvertWallet(undefined);
    setSignerEmail('');
    setSignerUserId('');
    setConvertModalOpen(true);
  };

  const handleConvertAndAddSigner = async () => {
    if (!convertWallet) return;
    // No businessAccountId → the SDK find-or-creates the per-wallet business
    // account (seating you as owner + first signer), then reshares in the new
    // signer.
    const value = await run({
      action: () =>
        addBusinessAccountSigner({
          targetSignerIdentity:
            signerIdentifyBy === 'email'
              ? { identifier: signerEmail, identifierType: 'email' }
              : { userId: signerUserId },
          walletAccount: convertWallet as never,
        }),
      errorMessage: 'Failed to add signer',
      label: 'convertSigner',
      successMessage: 'Signer added',
    });
    if (value) {
      setConvertModalOpen(false);
      setConvertWallet(undefined);
      setSignerEmail('');
      setSignerUserId('');
      // Ownership moved to the (new) business account — refresh so the wallet's
      // updated association is reflected in this session.
      await refreshAuth();
      await loadAccounts();
    }
  };

  const members: BusinessAccountMember[] = detail?.members ?? [];
  // Only the current owner can transfer ownership; gate the action on it.
  const currentUserIsOwner = members.some(
    (m) => m.userId === currentUserId && m.role === 'owner'
  );
  const signers: BusinessAccountSigner[] = detail?.signers ?? [];
  const wallets: BusinessAccountWalletSummary[] =
    detail?.wallets ??
    [
      ...new Set(
        (detail?.signers ?? []).map((signer) => signer.walletId).filter(Boolean)
      ),
      // Signer-derived fallback wallets carry only an id (no chain/publicKey).
    ].map((id) => ({ id } as BusinessAccountWalletSummary));

  const signersFor = (walletId?: string) =>
    signers.filter((signer) => signer.walletId === walletId);

  // A reshare must start from a wallet the current user already signs for. This
  // is the authoritative server view (detail.signers), independent of whether
  // the wallet happens to be in this session's getWalletAccounts().
  const currentUserSignsWallet = (wallet: BusinessAccountWalletSummary) =>
    Boolean(currentUserId) &&
    signers.some(
      (signer) =>
        signer.walletId === wallet.id &&
        signer.userId === currentUserId &&
        Boolean(signer.shareSetId)
    );

  // Wallets already under the selected account can't be linked again.
  const linkedAddresses = new Set(
    wallets.map((wallet) => wallet.publicKey?.toLowerCase()).filter(Boolean)
  );

  // Only V3 dynamicwaas embedded wallets have a WaaS share set and can be
  // transferred; smart contract wallets (zerodev) are signer-only views.
  const v3EmbeddedVcIds = useMemo(() => {
    const ids = new Set<string>();
    for (const vc of user?.verifiedCredentials ?? []) {
      if (vc.walletName === 'dynamicwaas') ids.add(vc.id);
    }
    return ids;
  }, [user?.verifiedCredentials]);

  const linkableWallets = personalWallets.filter(
    (wallet) =>
      !linkedAddresses.has(wallet.address.toLowerCase()) &&
      !!wallet.verifiedCredentialId &&
      v3EmbeddedVcIds.has(wallet.verifiedCredentialId)
  );

  // Exclude wallets already owned by a business account — they have no active
  // personal share set to reshare from.
  const convertableWallets = personalWallets.filter(
    (wallet) => !(wallet.businessAccountId as string | undefined)
  );

  const signerReady = signerIdentifyBy === 'email' ? signerEmail : signerUserId;

  const signerIdentityFields = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label>Identify new signer by</Label>
        <Select
          value={signerIdentifyBy}
          onValueChange={(value) =>
            setSignerIdentifyBy(value as SignerIdentifyBy)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="userId">User ID</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {signerIdentifyBy === 'email' ? (
        <Input
          type="text"
          value={signerEmail}
          onChange={(e) => setSignerEmail(e.target.value)}
          placeholder="new-signer@email.com"
        />
      ) : (
        <Input
          type="text"
          value={signerUserId}
          onChange={(e) => setSignerUserId(e.target.value)}
          placeholder="Signer user ID"
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-page mt-16 md:mt-0">
      <div className="mx-auto max-w-[1040px] px-4 sm:px-6 pt-8 sm:pt-10 pb-10 flex flex-col gap-4">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              Business Accounts
            </h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-[520px] leading-relaxed">
              Create a shared account, bring wallets under it, and add
              co-signers — multiple people signing on the same MPC wallets.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={openConvertModal}
            disabled={Boolean(busy)}
          >
            Add signer to a personal wallet
          </Button>
        </div>

        {!accountsLoaded && (
          <div
            className={cn(
              CARD,
              'p-10 text-center text-sm text-muted-foreground'
            )}
          >
            Loading accounts…
          </div>
        )}

        {accountsLoaded && accounts.length === 0 && (
          <div className={cn(CARD, 'p-12')}>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="text-base font-semibold text-foreground">
                No business accounts yet
              </div>
              <p className="text-xs text-muted-foreground max-w-[340px] leading-relaxed">
                Create a shared account to bring wallets under it and add
                co-signers from your team.
              </p>
              <Button onClick={openCreateModal} loading={busy === 'create'}>
                Create account
              </Button>
            </div>
          </div>
        )}

        {accountsLoaded && accounts.length > 0 && !detail && (
          <div className={cn(CARD, 'p-10')}>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="text-sm font-semibold text-foreground">
                Couldn&apos;t load account details.
              </div>
              <Button
                onClick={() => void loadAccounts()}
                loading={busy === 'accounts'}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {accountsLoaded && accounts.length > 0 && detail && (
          <div className="grid gap-4 items-start lg:grid-cols-[320px_1fr]">
            {/* LEFT — account switcher + members */}
            <div className="flex flex-col gap-4">
              <div className={CARD}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex flex-col items-center gap-2 px-4 pt-6 pb-4 text-center outline-none cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                        {initials(detail.name)}
                      </div>
                      <div className="flex items-center gap-1.5 text-base font-bold text-foreground">
                        {detail.name || 'Untitled account'}
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className={MONO}>{detail.id}</div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-[280px]">
                    {accounts.map((account) => (
                      <DropdownMenuItem
                        key={account.id}
                        onSelect={() => void selectAccount({ id: account.id })}
                        className="gap-2"
                      >
                        <span className="flex-1 font-medium truncate">
                          {account.name || 'Untitled account'}
                        </span>
                        {account.id === businessId ? (
                          <span className="font-bold text-foreground">✓</span>
                        ) : (
                          <span className="font-mono text-xs text-muted-foreground">
                            {short(account.id)}
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={openCreateModal}
                      className="gap-2 font-semibold text-primary focus:text-primary"
                    >
                      <Plus className="w-4 h-4" />
                      Create account
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="border-t border-border/60 flex justify-center p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={Boolean(busy)}
                    onClick={() =>
                      void run({
                        action: () => loadDetail({ id: detail.id }),
                        label: 'load',
                      })
                    }
                  >
                    Refresh
                  </Button>
                </div>
              </div>

              <div className={cn(CARD, 'p-5 flex flex-col gap-3')}>
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  Members
                  <span className={cn(PILL, PILL_NEUTRAL)}>
                    {members.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                  {members.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
                      No members.
                    </div>
                  )}
                  {members.map((member, index) => (
                    <div
                      key={member.userId ?? index}
                      className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={AVATAR}>
                          {initials(member.userId)}
                        </span>
                        <span
                          className={cn(MONO, 'flex-1 min-w-0 truncate')}
                          title={member.userId}
                        >
                          {member.userId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {Boolean(currentUserId) &&
                          member.userId === currentUserId && (
                            <span className={cn(PILL, PILL_YOU)}>you</span>
                          )}
                        {member.role && (
                          <span
                            className={cn(
                              PILL,
                              member.role === 'owner'
                                ? PILL_BRAND
                                : PILL_NEUTRAL
                            )}
                          >
                            {member.role}
                          </span>
                        )}
                        {currentUserIsOwner &&
                          member.role !== 'owner' &&
                          member.userId !== currentUserId && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-auto"
                              loading={busy === `transfer:${member.userId}`}
                              disabled={Boolean(busy)}
                              onClick={() =>
                                void handleTransferOwnership({ member })
                              }
                            >
                              Make owner
                            </Button>
                          )}
                        {member.role !== 'owner' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto"
                            loading={busy === `removeMember:${member.userId}`}
                            disabled={Boolean(busy)}
                            onClick={() => void handleRemoveMember({ member })}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <Label>Identify by</Label>
                    <Select
                      value={memberIdentifyBy}
                      onValueChange={(value) =>
                        setMemberIdentifyBy(value as MemberIdentifyBy)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="userId">User ID</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Role</Label>
                    <Select
                      value={memberRole}
                      onValueChange={(value) =>
                        setMemberRole(value as AssignableMemberRole)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Input
                  type="text"
                  value={
                    memberIdentifyBy === 'email' ? memberEmail : memberUserId
                  }
                  onChange={(e) =>
                    memberIdentifyBy === 'email'
                      ? setMemberEmail(e.target.value)
                      : setMemberUserId(e.target.value)
                  }
                  placeholder={
                    memberIdentifyBy === 'email'
                      ? 'new-member@email.com'
                      : 'Member user ID'
                  }
                />
                <Button
                  onClick={() => void handleAddMember()}
                  loading={busy === 'member'}
                  disabled={
                    (memberIdentifyBy === 'email'
                      ? !memberEmail
                      : !memberUserId) || Boolean(busy)
                  }
                >
                  Add
                </Button>
              </div>
            </div>

            {/* RIGHT — wallets & signers */}
            <div className={cn(CARD, 'p-5 flex flex-col gap-4')}>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  Wallets &amp; signers
                  <span className={cn(PILL, PILL_NEUTRAL)}>
                    {wallets.length}
                  </span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLinkModalOpen(true)}
                  disabled={Boolean(busy)}
                >
                  Link existing wallet
                </Button>
              </div>

              {wallets.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-6 text-center text-xs text-muted-foreground">
                  No wallets yet — create or link one.
                </div>
              )}

              {wallets.map((wallet) => {
                const walletSigners = signersFor(wallet.id);
                return (
                  <div
                    key={wallet.id}
                    className="rounded-xl border border-border/60 overflow-hidden"
                  >
                    <div className="flex items-center gap-3 bg-muted/30 px-3.5 py-3">
                      {wallet.chain && (
                        <span className={cn(PILL, PILL_BRAND)}>
                          {wallet.chain}
                        </span>
                      )}
                      <span
                        className={cn(
                          MONO,
                          'flex-1 font-medium text-foreground'
                        )}
                      >
                        {wallet.publicKey ?? wallet.id}
                      </span>
                      {currentUserSignsWallet(wallet) && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={Boolean(busy)}
                          onClick={() => openSignerModal({ wallet })}
                        >
                          Add signer
                        </Button>
                      )}
                    </div>
                    {walletSigners.map((signer, index) => {
                      const isYou =
                        Boolean(currentUserId) &&
                        signer.userId === currentUserId;
                      // The backend refuses to remove the last signer on a wallet.
                      const isLastSigner = walletSigners.length <= 1;
                      return (
                        <div
                          key={`${signer.userId}-${index}`}
                          className="flex items-center gap-2.5 border-t border-border/60 px-3.5 py-2.5"
                        >
                          <span className={AVATAR}>
                            {initials(signer.userId)}
                          </span>
                          <span className="flex-1 text-xs text-foreground truncate">
                            {signer.userId}
                          </span>
                          {isYou && (
                            <span className={cn(PILL, PILL_YOU)}>
                              your signer
                            </span>
                          )}
                          <span
                            className={cn(
                              PILL,
                              signer.shareSetId ? PILL_ACTIVE : PILL_PENDING
                            )}
                          >
                            {signer.shareSetId ? 'active' : 'pending'}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            loading={busy === `removeSigner:${signer.id}`}
                            disabled={Boolean(busy) || isLastSigner}
                            onClick={() => void handleRemoveSigner({ signer })}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })}
                    {walletSigners.length === 0 && (
                      <div className="border-t border-border/60 px-3.5 py-2.5 text-xs text-muted-foreground">
                        No signers on this wallet yet.
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex items-end gap-2">
                <div className="flex flex-col gap-1.5">
                  <Label>Chain</Label>
                  <Select
                    value={effectiveCreateChain}
                    onValueChange={setCreateChain}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {enabledChainNames.map((chain) => (
                        <SelectItem key={chain} value={chain}>
                          {chain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => void handleCreateWallet()}
                  loading={busy === 'wallet'}
                  disabled={Boolean(busy) || !effectiveCreateChain}
                >
                  Create wallet
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Create business account */}
        <Dialog
          open={createOpen}
          onOpenChange={(open) => !busy && setCreateOpen(open)}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogTitle>Create business account</DialogTitle>
            <DialogDescription>
              Give it a name your team will recognize. You can rename it later.
            </DialogDescription>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ba-name">Name</Label>
              <Input
                id="ba-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Treasury"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                disabled={Boolean(busy)}
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleCreateAccount()}
                loading={busy === 'create'}
                disabled={Boolean(busy)}
              >
                Create account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add signer to the selected wallet */}
        <Dialog
          open={signerModalOpen}
          onOpenChange={(open) => !busy && setSignerModalOpen(open)}
        >
          <DialogContent className="sm:max-w-[500px]">
            {signerTargetWallet && (
              <>
                <DialogTitle>Add signer</DialogTitle>
                <DialogDescription>
                  Reshares from the selected wallet to mint the new
                  signer&apos;s share set.
                </DialogDescription>
                <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2.5">
                  <span className="text-xs text-muted-foreground">Wallet</span>
                  <span className={cn(MONO, 'flex-1')}>
                    {signerTargetWallet.publicKey ?? signerTargetWallet.id}
                  </span>
                  {signerTargetWallet.chain && (
                    <span className={cn(PILL, PILL_BRAND)}>
                      {signerTargetWallet.chain}
                    </span>
                  )}
                </div>
                {signerIdentityFields}
                <DialogFooter>
                  <Button
                    variant="outline"
                    disabled={Boolean(busy)}
                    onClick={() => setSignerModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => void handleAddSigner()}
                    loading={busy === 'signer'}
                    disabled={Boolean(busy) || !signerReady}
                  >
                    Add Signer
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Link an existing wallet */}
        <Dialog
          open={linkModalOpen}
          onOpenChange={(open) => !busy && setLinkModalOpen(open)}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogTitle>Link an existing wallet</DialogTitle>
            <DialogDescription>
              Bring one of your personal wallets under this account so
              co-signers can be added to it.
            </DialogDescription>
            <div className="flex flex-col gap-2">
              {linkableWallets.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
                  No Dynamic V3 embedded wallets found to link. Smart contract
                  wallets cannot be transferred to a business account.
                </div>
              )}
              {linkableWallets.map((wallet) => (
                <div
                  key={`link-${wallet.id}`}
                  className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5"
                >
                  <span className={cn(MONO, 'flex-1')}>{wallet.address}</span>
                  {wallet.chain && (
                    <span className={cn(PILL, PILL_BRAND)}>{wallet.chain}</span>
                  )}
                  <Button
                    size="sm"
                    loading={busy === 'link'}
                    disabled={Boolean(busy) || !wallet.verifiedCredentialId}
                    onClick={() =>
                      wallet.verifiedCredentialId &&
                      void handleLinkWallet({
                        walletId: wallet.verifiedCredentialId,
                      })
                    }
                  >
                    Link
                  </Button>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                disabled={Boolean(busy)}
                onClick={() => setLinkModalOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add a signer to a personal wallet (converts it into a business account) */}
        <Dialog
          open={convertModalOpen}
          onOpenChange={(open) => !busy && setConvertModalOpen(open)}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogTitle>Add a signer to a personal wallet</DialogTitle>
            <DialogDescription>
              Pick one of your personal wallets and add a co-signer. This
              creates a business account for the wallet (you become the owner)
              and reshares in the new signer.
            </DialogDescription>
            <div className="flex flex-col gap-2">
              {convertableWallets.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
                  No personal wallets found.
                </div>
              )}
              {convertableWallets.map((wallet) => (
                <button
                  key={`convert-${wallet.id}`}
                  type="button"
                  onClick={() => setConvertWallet(wallet)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border bg-muted/30 px-3 py-2.5 text-left transition-colors',
                    convertWallet?.id === wallet.id
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-border/60 hover:border-border'
                  )}
                >
                  <span className={cn(MONO, 'flex-1')}>{wallet.address}</span>
                  {wallet.chain && (
                    <span className={cn(PILL, PILL_BRAND)}>{wallet.chain}</span>
                  )}
                  {convertWallet?.id === wallet.id && (
                    <span className="font-bold text-primary">✓</span>
                  )}
                </button>
              ))}
            </div>
            {convertWallet && signerIdentityFields}
            <DialogFooter>
              <Button
                variant="outline"
                disabled={Boolean(busy)}
                onClick={() => setConvertModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleConvertAndAddSigner()}
                loading={busy === 'convertSigner'}
                disabled={Boolean(busy) || !convertWallet || !signerReady}
              >
                Convert &amp; add signer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Developer: last raw SDK response */}
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            disabled={!result}
            onClick={() => setShowResult((open) => !open)}
          >
            <Wallet className="w-3.5 h-3.5" />
            {showResult ? 'Hide last response' : 'Show last response'}
          </Button>
          {showResult && result && (
            <pre
              data-testid="business-accounts-result"
              className="rounded-xl border border-border/60 bg-muted/40 p-4 text-xs font-mono text-foreground overflow-auto max-h-80"
            >
              {result}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
