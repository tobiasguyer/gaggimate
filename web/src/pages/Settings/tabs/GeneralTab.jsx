import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash';
import { timezones } from '../../../config/zones.js';
import { DASHBOARD_LAYOUTS } from '../../../utils/dashboardManager.js';
import Section from '../../../components/Card.jsx';
import {
  InputGroupField,
  SettingsFormField,
  ToggleField,
} from '../../../components/SettingsFormField.jsx';

const THEMES = [
  { id: 0, name: 'Dark Theme' },
  { id: 1, name: 'Light Theme' },
  { id: 3, name: 'McIntosh' },
  { id: 4, name: 'Electric Circus' },
  { id: 5, name: 'Arcade Glow' },
  { id: 6, name: 'Neon' },
  { id: 7, name: 'Synthwave' },
  { id: 8, name: 'Disco' },
  { id: 9, name: 'Sunset' },
  { id: 10, name: 'Sunrise' },
  { id: 11, name: 'Coffee' },
  { id: 12, name: 'Espresso' },
  { id: 13, name: 'Matcha' },
  { id: 14, name: 'Forest' },
  { id: 15, name: 'Ocean' },
  { id: 16, name: 'Lagoon' },
  { id: 17, name: 'Arctic' },
  { id: 18, name: 'Ice' },
  { id: 19, name: 'Cherry' },
  { id: 20, name: 'Rose' },
  { id: 21, name: 'Lavender' },
  { id: 22, name: 'Cyberpunk' },
  { id: 23, name: 'Terminal' },
  { id: 24, name: 'Matrix' },
  { id: 25, name: 'Nord' },
  { id: 26, name: 'Dracula' },
  { id: 27, name: 'Gruvbox' },
  { id: 28, name: 'Solarized' },
  { id: 29, name: 'Desert' },
  { id: 30, name: 'Volcano' },
  { id: 31, name: 'Candy' },
  { id: 32, name: 'Retro' },
  { id: 33, name: 'Aurora' },
  { id: 34, name: 'Royal' },
  { id: 35, name: 'Neon Alley Dark' },
  { id: 36, name: 'Neon Alley Light' },
  { id: 37, name: 'Cafe Static Dark' },
  { id: 38, name: 'Cafe Static Light' },
  { id: 39, name: 'Disco Memory Dark' },
  { id: 40, name: 'Disco Memory Light' },
  { id: 41, name: 'Soft Horizon Light' },
  { id: 42, name: 'Overgrown Dark' },
  { id: 43, name: 'Overgrown Light' },
  { id: 44, name: 'Glitch Ice Dark' },
  { id: 45, name: 'Deep Space Dark' },
  { id: 46, name: 'Custom' }, // theme_colors[46] — colors editable below
];

// Field names line up 1:1 with theme_colors[46][0..7] on the firmware side.
const CUSTOM_THEME_FIELDS = [
  { key: 'customThemeNiceWhite', label: 'Nice White' },
  { key: 'customThemeDark', label: 'Dark' },
  { key: 'customThemeProgress', label: 'Progress' },
  { key: 'customThemeSemiDark', label: 'Semi Dark' },
  { key: 'customThemeHeating', label: 'Heating' },
  { key: 'customThemeTicks', label: 'Ticks' },
  { key: 'customThemeTemperature', label: 'Temperature' },
  { key: 'customThemePressure', label: 'Pressure' },
];

function ButtonBehaviorSelect({ id, label, value, onChange, profiles }) {
  return (
    <SettingsFormField label={label} htmlFor={id} noMargin >
      <select
        id={id}
        name={id}
        className='select select-bordered w-full'
        value={value}
        onChange={onChange}
      >
        <option value='none'>None</option>
        <option value='brew'>Brew button</option>
        <option value='steam'>Steam button</option>
        <option value='water'>Water button</option>
        <option value='flush'>Flush</option>
        {profiles.map(p => (
          <option key={p.id} value={p.id}>
            Profile: {p.label}
          </option>
        ))}
      </select>
    </SettingsFormField>
  );
}

function PasswordField({ id, label, placeholder, value, onChange, shown, setShown, ...rest }) {
  return (
    <label className='input w-full'>
      <input
        id={id}
        name={id}
        type={shown ? 'text' : 'password'}
        placeholder={placeholder ?? label}
        value={value}
        onChange={onChange}
        {...rest}
      />
      <button
        type='button'
        className='hover:text-primary cursor-pointer focus:outline-none'
        aria-label='Show Password'
        onClick={() => setShown(!shown)}
      >
        <FontAwesomeIcon icon={shown ? faEyeSlash : faEye} />
      </button>
    </label>
  );
}

function ThemeColorField({ id, label, value, onChange }) {
  return (
    <SettingsFormField label={label} htmlFor={id} noMargin>
      <label className='input input-bordered w-full cursor-pointer p-1' htmlFor={id}>
        <div className='h-full w-full rounded-sm' style={{ backgroundColor: value || '#000000' }}>
          <input
            id={id}
            name={id}
            type='color'
            className='input input-bordered invisible w-full'
            value={value || '#000000'}
            onChange={onChange}
          />
        </div>
      </label>
    </SettingsFormField>
  );
}

export function GeneralTab({
  formData,
  onChange,
  profiles,
  currentTheme,
  setCurrentTheme,
  handleThemeChange,
  showWifiPassword,
  setShowWifiPassword,
  showApPassword,
  setShowApPassword,
}) {
  const showCustomThemeColors =
    Number(formData.themeMode) === 46 || Number(formData.standbyThemeMode) === 46;

  return (
    <div className='space-y-4 sm:space-y-6 lg:grid lg:grid-cols-2 lg:gap-4'>
      {/* User Preferences */}
      <Section title='User Preferences' className='h-full' >
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <SettingsFormField label='Startup Mode' htmlFor='startup-mode' noMargin>
            <select
              id='startup-mode'
              name='startupMode'
              className='select select-bordered w-full'
              onChange={onChange('startupMode')}
            >
              <option value='standby' selected={formData.startupMode === 'standby'}>
                Standby
              </option>
              <option value='brew' selected={formData.startupMode === 'brew'}>
                Brew
              </option>
            </select>
          </SettingsFormField>
          <SettingsFormField label='Startup Profile' htmlFor='startup-profile' noMargin>
            <select
              id='startup-profile'
              name='startupProfile'
              className='select select-bordered w-full'
              value={formData.startupProfile || ''}
              onChange={onChange('startupProfile')}
            >
              <option value=''>Last used profile</option>
              {profiles.map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.label}
                </option>
              ))}
            </select>
          </SettingsFormField>
          <InputGroupField
            label='Standby Timeout'
            htmlFor='standbyTimeout'
            unit='s'
            unitAriaLabel='seconds'
            noMargin
          >
            <input
              id='standbyTimeout'
              name='standbyTimeout'
              type='number'
              placeholder='0'
              value={formData.standbyTimeout}
              onChange={onChange('standbyTimeout')}
            />
          </InputGroupField>
        </div>

        {/* Predictive Scale Delay */}
        <div className='border-base-content/5 mt-6 border-t pt-6'>
          <h3 className='text-md text-base-content mb-2 font-semibold'>Predictive Scale Delay</h3>
          <p className='text-base-content/85 mb-4 text-sm opacity-70'>
            Shuts off the process ahead of time based on the flow rate to account for any dripping
            or delays in the control.
          </p>
          <div className='mb-4'>
            <ToggleField
              label='Auto Adjust'
              htmlFor='delayAdjust'
              checked={!!formData.delayAdjust}
              onChange={onChange('delayAdjust')}
            />
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <InputGroupField
              label='Brew'
              htmlFor='brewDelay'
              unit='ms'
              unitAriaLabel='milliseconds'
              noMargin
            >
              <input
                id='brewDelay'
                name='brewDelay'
                type='number'
                step='any'
                className='grow'
                placeholder='0'
                value={formData.brewDelay}
                onChange={onChange('brewDelay')}
              />
            </InputGroupField>
            <InputGroupField
              label='Grind'
              htmlFor='grindDelay'
              unit='ms'
              unitAriaLabel='milliseconds'
              noMargin
            >
              <input
                id='grindDelay'
                name='grindDelay'
                type='number'
                step='any'
                className='grow'
                placeholder='0'
                value={formData.grindDelay}
                onChange={onChange('grindDelay')}
              />
            </InputGroupField>
          </div>
        </div>

        {/* Buttons */}
        <div className='border-base-content/5 mt-6 border-t pt-6'>
          <h3 className='text-md text-base-content mb-2 font-semibold'>Physical Buttons</h3>
          <p className='text-base-content/85 mb-4 text-sm opacity-70'>
            Define behavior for physical buttons when pressed. Make sure they are wired to the Alt
            Relay Header.
          </p>
          <div className='mb-4'>
            <ToggleField
              label='Momentary Buttons'
              htmlFor='momentaryButtons'
              checked={!!formData.momentaryButtons}
              onChange={onChange('momentaryButtons')}
            />
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <ButtonBehaviorSelect
              id='button0'
              label='Brew Button Behavior'
              value={formData.button0}
              onChange={onChange('button0')}
              profiles={profiles}
            />
            <ButtonBehaviorSelect
              id='button1'
              label='Steam Button Behavior'
              value={formData.button1}
              onChange={onChange('button1')}
              profiles={profiles}
            />
            <ButtonBehaviorSelect
              id='button2'
              label='Water Button Behavior'
              value={formData.button2}
              onChange={onChange('button2')}
              profiles={profiles}
            />
          </div>
        </div>
      </Section>

      {/* Display Settings */}
      <Section title='Display Settings' className='h-full' >
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <SettingsFormField label='Main Brightness (1-16)' htmlFor='mainBrightness' noMargin>
            <input
              id='mainBrightness'
              name='mainBrightness'
              type='number'
              className='input input-bordered w-full'
              placeholder='16'
              min='1'
              max='16'
              value={formData.mainBrightness}
              onChange={onChange('mainBrightness')}
            />
          </SettingsFormField>
          <SettingsFormField label='Display Theme' htmlFor='themeMode' noMargin>
            <select
              id='themeMode'
              name='themeMode'
              className='select select-bordered w-full'
              value={formData.themeMode}
              onChange={onChange('themeMode')}
            >
              {THEMES.map(theme => (
                <option key={theme.id} value={theme.id}>
                  {theme.name || ''}
                </option>
              ))}
            </select>
          </SettingsFormField>
        </div>

        {/* Standby Display */}
        <div className='border-base-content/5 mt-6 border-t pt-6'>
          <div className='mb-4'>
            <ToggleField
              label='Enable standby display'
              htmlFor='standbyDisplayEnabled'
              checked={!!formData.standbyDisplayEnabled}
              onChange={onChange('standbyDisplayEnabled')}
            />
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <SettingsFormField
              label='Standby Brightness (0-16)'
              htmlFor='standbyBrightness'
              helpText='When the toggle is off, brightness will be set to 0'
              noMargin
            >
              <input
                id='standbyBrightness'
                name='standbyBrightness'
                type='number'
                className='input input-bordered w-full'
                placeholder='8'
                min='0'
                max='16'
                disabled={!formData.standbyDisplayEnabled}
                value={formData.standbyDisplayEnabled ? formData.standbyBrightness : 0}
                onChange={onChange('standbyBrightness')}
              />
            </SettingsFormField>
            <InputGroupField
              label='Standby Brightness Timeout'
              htmlFor='standbyBrightnessTimeout'
              unit='s'
              unitAriaLabel='seconds'
              noMargin
            >
              <input
                id='standbyBrightnessTimeout'
                name='standbyBrightnessTimeout'
                type='number'
                min='1'
                placeholder='60'
                value={formData.standbyBrightnessTimeout}
                onChange={onChange('standbyBrightnessTimeout')}
              />
            </InputGroupField>
          </div>
        </div>
      </Section>

      {/* Standby Display Settings */}
      <Section title='Standby Display Settings'>
        <SettingsFormField label='Standby Theme' htmlFor='standbyThemeMode' noMargin>
          <select
            id='standbyThemeMode'
            name='standbyThemeMode'
            className='select select-bordered w-full'
            value={formData.standbyThemeMode}
            onChange={onChange('standbyThemeMode')}
          >
            {THEMES.map(theme => (
              <option key={theme.id} value={theme.id}>
                {theme.name || ''}
              </option>
            ))}
          </select>
        </SettingsFormField>

        <div className='border-base-content/5 mt-6 grid grid-cols-1 gap-4 border-t pt-6'>
          <ToggleField
            label='Display Standby Logo'
            htmlFor='standbyLogo'
            checked={!!formData.standbyLogo}
            onChange={onChange('standbyLogo')}
          />
          <ToggleField
            label='Display Standby Status Container'
            htmlFor='standbyStatus'
            checked={!!formData.standbyStatus}
            onChange={onChange('standbyStatus')}
          />
          <ToggleField
            label='Display Standby Touch Icon'
            htmlFor='standbyTouchIcon'
            checked={!!formData.standbyTouchIcon}
            onChange={onChange('standbyTouchIcon')}
          />
          <SettingsFormField label='Display Analog Clock' htmlFor='standbyAnalogClock' noMargin>
            <select
              id='standbyAnalogClock'
              name='standbyAnalogClock'
              className='select select-bordered w-full'
              value={formData.standbyAnalogClock}
              onChange={onChange('standbyAnalogClock')}
            >
              <option value={0}>hidden</option>
              <option value={1}>SBB like</option>
              <option value={2}>Numerical clock</option>
              <option value={3}>Engelberg like</option>
              <option value={4}>Engelberg like v2</option>
              <option value={5}>minimal_hand</option>
              <option value={6}>minimal_arc</option>
              <option value={7}>minimal_point</option>
              <option value={8}>minimal_hand_v2</option>
              <option value={9}>minimal_android</option>
              <option value={10}>minimal_arc_v2</option>
              <option value={11}>minimal_arc_v3</option>
            </select>
          </SettingsFormField>
          <SettingsFormField label='Display Digital Clock' htmlFor='standbyDigitalClock' noMargin>
            <select
              id='standbyDigitalClock'
              name='standbyDigitalClock'
              className='select select-bordered w-full'
              value={formData.standbyDigitalClock}
              onChange={onChange('standbyDigitalClock')}
            >
              <option value={0}>hidden</option>
              <option value={1}>7 Segment</option>
              <option value={2}>Numerical clock</option>
              <option value={3}>Montserrat</option>
              <option value={4}>Colored</option>
            </select>
          </SettingsFormField>
          <ToggleField
            label='Display Binary Clock'
            htmlFor='standbyBinaryClock'
            checked={!!formData.standbyBinaryClock}
            onChange={onChange('standbyBinaryClock')}
          />
          <ToggleField
            label='Display Date on Standby'
            htmlFor='displayDate'
            checked={!!formData.displayDate}
            onChange={onChange('displayDate')}
          />
        </div>
      </Section>

      {/* Custom Theme Colors - only relevant once "Custom" is picked as the Theme or Standby Theme */}
      {showCustomThemeColors && (
        <Section title='Custom Theme Colors'>
          <div className='grid grid-cols-2 gap-4'>
            {CUSTOM_THEME_FIELDS.map(({ key, label }) => (
              <ThemeColorField
                key={key}
                id={key}
                label={label}
                value={formData[key]}
                onChange={onChange(key)}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Web Settings */}
      <Section title='Web Settings' className='h-full' >
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <SettingsFormField label='Theme' htmlFor='webui-theme' noMargin>
            <select
              id='webui-theme'
              name='webui-theme'
              className='select select-bordered w-full'
              value={currentTheme}
              onChange={e => {
                setCurrentTheme(e.target.value);
                handleThemeChange(e);
              }}
            >
              <option value='system'>System</option>
              <option value='light'>Light</option>
              <option value='dark'>Dark</option>
              <option value='coffee'>Coffee</option>
              <option value='nord'>Nord</option>
            </select>
          </SettingsFormField>
          <SettingsFormField label='Dashboard Layout' htmlFor='dashboardLayout' noMargin>
            <select
              id='dashboardLayout'
              name='dashboardLayout'
              className='select select-bordered w-full'
              value={formData.dashboardLayout || DASHBOARD_LAYOUTS.ORDER_FIRST}
              onChange={e => {
                onChange('dashboardLayout')(e);
              }}
            >
              <option value={DASHBOARD_LAYOUTS.ORDER_FIRST}>Process Controls First</option>
              <option value={DASHBOARD_LAYOUTS.ORDER_LAST}>Chart First</option>
            </select>
          </SettingsFormField>
        </div>
      </Section>

      {/* Network / System Preferences */}
      <Section title='System & Network' className='h-full' >
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <SettingsFormField label='Wi-Fi SSID' htmlFor='wifiSsid' noMargin>
            <input
              id='wifiSsid'
              name='wifiSsid'
              type='text'
              className='input input-bordered w-full'
              placeholder='Wi-Fi SSID'
              value={formData.wifiSsid}
              onChange={onChange('wifiSsid')}
            />
          </SettingsFormField>
          <SettingsFormField label='Wi-Fi Password' htmlFor='wifiPassword' noMargin>
            <PasswordField
              id='wifiPassword'
              label='Wi-Fi Password'
              value={formData.wifiPassword}
              onChange={onChange('wifiPassword')}
              shown={showWifiPassword}
              setShown={setShowWifiPassword}
            />
          </SettingsFormField>
          <SettingsFormField
            label='Access Point Password'
            htmlFor='apPassword'
            helpText='Used for the GaggiMate hotspot when no Wi-Fi is configured (min. 8 characters).'
            noMargin
          >
            <PasswordField
              id='apPassword'
              label='Access Point Password'
              minLength={8}
              maxLength={63}
              value={formData.apPassword}
              onChange={onChange('apPassword')}
              shown={showApPassword}
              setShown={setShowApPassword}
            />
          </SettingsFormField>
          <SettingsFormField label='Hostname' htmlFor='mdnsName' noMargin>
            <input
              id='mdnsName'
              name='mdnsName'
              type='text'
              className='input input-bordered w-full'
              placeholder='Hostname'
              value={formData.mdnsName}
              onChange={onChange('mdnsName')}
            />
          </SettingsFormField>
          <SettingsFormField label='Time Zone' htmlFor='timezone' noMargin>
            <select
              id='timezone'
              name='timezone'
              className='select select-bordered w-full'
              onChange={onChange('timezone')}
            >
              {timezones.map(tz => (
                <option key={tz} value={tz} selected={formData.timezone === tz}>
                  {tz}
                </option>
              ))}
            </select>
          </SettingsFormField>
        </div>

        {/* Clock */}
        <div className='border-base-content/5 mt-6 border-t pt-6'>
          <ToggleField
            label='Use 24h Format'
            htmlFor='clock24hFormat'
            checked={!!formData.clock24hFormat}
            onChange={onChange('clock24hFormat')}
          />
        </div>
      </Section>
    </div>
  );
}