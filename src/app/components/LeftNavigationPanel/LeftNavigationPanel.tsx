import { isDeviceRegistrationRequired, logout } from '@dynamic-labs-sdk/client';
import {
  CreditCard,
  Globe,
  Key,
  LogOut,
  Menu,
  PenTool,
  Radio,
  Smartphone,
  User,
  UsersRound,
  Wallet,
  X,
} from 'lucide-react';
import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUser } from '../../hooks/useUser';
import { NavigationButton } from '../NavigationButton';
import { NavigationLink } from '../NavigationLink';

const DynamicLogoMark: FC<{ className?: string }> = ({ className }) => (
  <svg
    width="28"
    height="24"
    viewBox="0 0 28 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12.0639 1.80289C11.5488 2.28286 11.0427 2.75394 10.5366 3.2228C8.18574 5.40488 5.8349 7.58919 3.48184 9.76683C2.94241 10.2668 2.383 10.7468 1.70594 11.0401C0.900128 11.3889 0.438394 11.1712 0.178669 10.3023C-0.18317 9.08687 0.00995842 7.95361 0.709218 6.90923C1.30414 6.0204 2.05446 5.28045 2.82476 4.56049C4.05234 3.4139 5.28881 2.27841 6.54082 1.16293C7.08913 0.674073 7.68849 0.227435 8.42105 0.0785558C10.6143 -0.363638 12.0128 1.73845 12.0661 1.80067L12.0639 1.80289Z"
      fill="currentColor"
    />
    <path
      d="M1.5105 12.9044C2.84464 12.52 3.8458 11.6734 4.82033 10.7823C7.92814 7.94695 11.0315 5.10935 14.1527 2.28953C14.8408 1.66735 15.5645 1.07183 16.3304 0.551865C17.3049 -0.110315 18.3638 -0.205864 19.4071 0.425206C19.7845 0.651859 20.1552 0.916287 20.4615 1.23182C21.5249 2.33175 22.5749 3.44946 23.5982 4.58716C24.6859 5.79597 25.7559 7.02256 26.797 8.27137C27.1544 8.70023 27.4475 9.2002 27.6894 9.70683C28.1401 10.649 28.0246 11.58 27.4763 12.4578C26.9857 13.2444 26.3287 13.8888 25.6516 14.4999C23.0011 16.8953 20.3505 19.2907 17.6689 21.6527C16.9497 22.2882 16.1572 22.8571 15.3403 23.3593C13.8019 24.3081 12.2591 24.1904 10.8562 23.066C10.0392 22.4127 9.27117 21.6816 8.56969 20.9039C6.30986 18.3996 4.09221 15.8598 1.85902 13.331C1.7458 13.2044 1.64369 13.0666 1.5105 12.9022V12.9044Z"
      fill="currentColor"
    />
  </svg>
);

const DynamicWordmark: FC<{ className?: string }> = ({ className }) => (
  <svg
    width="58"
    height="14"
    viewBox="0 0 58 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M6.3034 0.368042H8.24632V10.9021H6.3034V10.0142C5.73127 10.747 4.91724 11.1122 3.86386 11.1122C2.81048 11.1122 1.98365 10.7278 1.26561 9.96038C0.547573 9.19294 0.189194 8.25254 0.189194 7.13918C0.189194 6.02582 0.547573 5.08542 1.26561 4.31798C1.98365 3.55054 2.84888 3.16618 3.86386 3.16618C4.87884 3.16618 5.73127 3.5326 6.3034 4.26417V0.36676V0.368042ZM2.72601 8.66765C3.12278 9.06354 3.62195 9.26213 4.2248 9.26213C4.82764 9.26213 5.32425 9.06354 5.71591 8.66765C6.10757 8.27176 6.3034 7.76184 6.3034 7.14046C6.3034 6.51908 6.10757 6.00916 5.71591 5.61327C5.32425 5.21738 4.82764 5.0188 4.2248 5.0188C3.62195 5.0188 3.12278 5.21738 2.72601 5.61327C2.32923 6.00916 2.13084 6.51908 2.13084 7.14046C2.13084 7.76184 2.32923 8.27176 2.72601 8.66765Z"
      fill="currentColor"
    />
    <path
      d="M14.7394 3.37756H16.818L14.0725 10.9149C13.6809 11.9898 13.1625 12.77 12.5149 13.2569C11.8685 13.7437 11.0634 13.9628 10.1009 13.9116V12.1064C10.6231 12.1166 11.0366 12.0064 11.3437 11.7758C11.6496 11.5452 11.8941 11.1737 12.0746 10.6625L8.9874 3.37884H11.1108L13.0742 8.43574L14.7407 3.37884L14.7394 3.37756Z"
      fill="currentColor"
    />
    <path
      d="M21.7559 3.1662C22.5789 3.1662 23.2599 3.44166 23.7961 3.99385C24.3337 4.54605 24.6012 5.30836 24.6012 6.28079V10.9008H22.6583V6.52166C22.6583 6.02071 22.5226 5.63635 22.2513 5.36986C21.9799 5.10465 21.619 4.97141 21.1672 4.97141C20.6654 4.97141 20.2635 5.12643 19.9628 5.43776C19.662 5.7491 19.511 6.21545 19.511 6.83683V10.8995H17.568V3.37503H19.511V4.21806C19.9832 3.51597 20.7307 3.16492 21.7547 3.16492L21.7559 3.1662Z"
      fill="currentColor"
    />
    <path
      d="M31.6741 3.3776H33.617V10.9021H31.6741V10.0142C31.0917 10.7471 30.2738 11.1122 29.2192 11.1122C28.1645 11.1122 27.3543 10.7278 26.6363 9.9604C25.9183 9.19296 25.5599 8.25256 25.5599 7.1392C25.5599 6.02584 25.9183 5.08544 26.6363 4.318C27.3543 3.55056 28.2144 3.1662 29.2192 3.1662C30.2738 3.1662 31.0917 3.53262 31.6741 4.26419V3.37632V3.3776ZM28.089 8.66767C28.4807 9.06356 28.9773 9.26215 29.5801 9.26215C30.183 9.26215 30.6821 9.06356 31.0789 8.66767C31.4757 8.27178 31.6741 7.76186 31.6741 7.14048C31.6741 6.5191 31.4757 6.00918 31.0789 5.61329C30.6821 5.2174 30.183 5.01881 29.5801 5.01881C28.9773 5.01881 28.4807 5.2174 28.089 5.61329C27.6973 6.00918 27.5015 6.5191 27.5015 7.14048C27.5015 7.76186 27.6973 8.27178 28.089 8.66767Z"
      fill="currentColor"
    />
    <path
      d="M43.1742 3.1662C44.0381 3.1662 44.728 3.44678 45.2451 4.00923C45.7622 4.57167 46.0207 5.32374 46.0207 6.2667V10.9021H44.0778V6.40251C44.0778 5.95153 43.9677 5.60048 43.7463 5.34936C43.5249 5.09825 43.2139 4.97269 42.812 4.97269C42.3704 4.97269 42.0261 5.11875 41.7804 5.40958C41.5346 5.70041 41.4117 6.12193 41.4117 6.67412V10.9034H39.4688V6.40379C39.4688 5.95281 39.3587 5.60176 39.1373 5.35064C38.9159 5.09953 38.6049 4.97397 38.203 4.97397C37.7716 4.97397 37.4273 5.12003 37.1713 5.41086C36.9154 5.70169 36.7874 6.12321 36.7874 6.6754V10.9046H34.8444V3.38016H36.7874V4.17835C37.2392 3.50572 37.9367 3.17004 38.8813 3.17004C39.8259 3.17004 40.4876 3.53134 40.9292 4.25394C41.4309 3.53134 42.1797 3.17004 43.1729 3.17004L43.1742 3.1662Z"
      fill="currentColor"
    />
    <path
      d="M48.2171 2.47433C47.8959 2.47433 47.6168 2.35646 47.3813 2.12072C47.1458 1.88498 47.0268 1.60696 47.0268 1.28538C47.0268 0.963801 47.1446 0.683218 47.3813 0.442353C47.6168 0.201487 47.8959 0.0810547 48.2171 0.0810547C48.5384 0.0810547 48.8315 0.201487 49.0683 0.442353C49.3038 0.683218 49.4215 0.963801 49.4215 1.28538C49.4215 1.60696 49.3038 1.88498 49.0683 2.12072C48.8328 2.35646 48.5486 2.47433 48.2171 2.47433ZM47.2533 10.9021V3.37758H49.1963V10.9021H47.2533Z"
      fill="currentColor"
    />
    <path
      d="M54.1252 11.1122C52.9899 11.1122 52.0441 10.7317 51.2864 9.96809C50.5286 9.20577 50.1498 8.26281 50.1498 7.1392C50.1498 6.01559 50.5286 5.07262 51.2864 4.31031C52.0441 3.548 52.9912 3.1662 54.1252 3.1662C54.8586 3.1662 55.5255 3.34172 56.1283 3.69277C56.7312 4.04382 57.1881 4.5153 57.4991 5.10722L55.8275 6.08477C55.6765 5.77344 55.4487 5.52745 55.1428 5.3468C54.8369 5.16615 54.4926 5.07647 54.1111 5.07647C53.5288 5.07647 53.0463 5.26993 52.6648 5.65557C52.2834 6.04249 52.0927 6.53575 52.0927 7.13792C52.0927 7.74008 52.2834 8.21925 52.6648 8.60489C53.0463 8.99181 53.5288 9.18399 54.1111 9.18399C54.5028 9.18399 54.8509 9.09687 55.1581 8.92007C55.464 8.74454 55.6931 8.50111 55.8429 8.18978L57.5298 9.15324C57.1983 9.74516 56.7311 10.2192 56.1296 10.5754C55.5267 10.9315 54.8599 11.1096 54.1265 11.1096L54.1252 11.1122Z"
      fill="currentColor"
    />
  </svg>
);

const UserAvatar: FC<{ email: string | undefined }> = ({ email }) => {
  const initial = email?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="w-8 h-8 rounded-lg bg-sidebar-primary/20 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-semibold text-sidebar-primary">
        {initial}
      </span>
    </div>
  );
};

export const LeftNavigationPanel: FC = () => {
  const navigate = useNavigate();
  const user = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const deviceRegistrationRequired = user
    ? isDeviceRegistrationRequired(user)
    : false;

  const userDisplayName = user?.email ?? user?.phoneNumber;

  return (
    <>
      {/* Mobile menu button */}
      {!isMobileMenuOpen && (
        <button
          className="fixed top-4 left-4 z-50 md:hidden p-2 bg-background border border-border rounded-lg shadow-sm"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 flex flex-col bg-sidebar w-72 h-screen z-40 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <DynamicLogoMark className="w-6 h-5 text-sidebar-primary" />
            <DynamicWordmark className="w-[58px] h-3.5 text-sidebar-foreground" />
          </div>

          {/* Close button for mobile */}
          <button
            className="absolute top-5 right-4 md:hidden p-1.5 hover:bg-sidebar-accent rounded-md transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-4 h-4 text-sidebar-foreground/50" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-sidebar-border" />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-0.5">
          <NavigationLink
            navigateTo="/wallets"
            data-testid="wallets-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Wallet className="w-4 h-4" />
            Wallets
          </NavigationLink>

          <NavigationLink
            navigateTo="/networks"
            data-testid="networks-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Globe className="w-4 h-4" />
            Networks
          </NavigationLink>

          <NavigationLink
            navigateTo="/user"
            disabled={!user}
            data-testid="user-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <User className="w-4 h-4" />
            User
          </NavigationLink>

          <NavigationLink
            navigateTo="/social"
            disabled={!user}
            data-testid="social-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <UsersRound className="w-4 h-4" />
            Social
          </NavigationLink>

          <NavigationLink
            navigateTo="/mfa"
            disabled={!user}
            data-testid="mfa-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Key className="w-4 h-4" />
            MFA Devices
          </NavigationLink>

          <NavigationLink
            navigateTo="/passkey"
            disabled={!user}
            data-testid="passkey-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Key className="w-4 h-4" />
            Passkeys
          </NavigationLink>

          <NavigationLink
            navigateTo="/funding"
            disabled={!user}
            data-testid="funding-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <CreditCard className="w-4 h-4" />
            Funding
          </NavigationLink>

          <NavigationLink
            navigateTo="/device-signing"
            disabled={!user}
            data-testid="device-signing-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <PenTool className="w-4 h-4" />
            Device Signing
          </NavigationLink>

          <NavigationLink
            navigateTo="/registered-devices"
            disabled={!user}
            data-testid="registered-devices-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Smartphone className="w-4 h-4" />
            Registered Devices
          </NavigationLink>

          <NavigationLink
            navigateTo="/realtime"
            disabled={!user}
            data-testid="realtime-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Radio className="w-4 h-4" />
            Realtime
          </NavigationLink>
        </nav>

        {/* Divider */}
        <div className="mx-4 border-t border-sidebar-border" />

        {/* User area */}
        <div className="px-4 py-4 flex flex-col gap-3">
          {userDisplayName && (
            <div className="flex items-center gap-3 px-1">
              <UserAvatar email={userDisplayName} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-sidebar-foreground/90 truncate">
                  {userDisplayName}
                </p>
                {deviceRegistrationRequired && (
                  <p className="text-[11px] text-amber-400 mt-0.5">
                    Device registration required
                  </p>
                )}
              </div>
            </div>
          )}

          <NavigationButton
            data-testid="logout-button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              void logout().then(() => navigate('/auth'));
            }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </NavigationButton>
        </div>
      </div>
    </>
  );
};
