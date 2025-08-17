import React from 'react';
import clsx from 'clsx';
import {
  useThemeConfig,
  ErrorCauseBoundary,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import {
  splitNavbarItems,
  useNavbarMobileSidebar,
} from '@docusaurus/theme-common/internal';
import NavbarItem from '@theme/NavbarItem';
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle';
import SearchBar from '@theme/SearchBar';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';
import NavbarLogo from '@theme/Navbar/Logo';
import NavbarSearch from '@theme/Navbar/Search';
import { useCamera } from '../../../hooks/useCamera';
import CameraGallery from '../../../components/CameraGallery';
import styles from './styles.module.css';
function useNavbarItems() {
  // TODO temporary casting until ThemeConfig type is improved
  return useThemeConfig().navbar.items;
}
function NavbarItems({items}) {
  return (
    <>
      {items.map((item, i) => (
        <ErrorCauseBoundary
          key={i}
          onError={(error) =>
            new Error(
              `A theme navbar item failed to render.
Please double-check the following navbar item (themeConfig.navbar.items) of your Docusaurus config:
${JSON.stringify(item, null, 2)}`,
              {cause: error},
            )
          }>
          <NavbarItem {...item} />
        </ErrorCauseBoundary>
      ))}
    </>
  );
}
function NavbarContentLayout({left, right}) {
  return (
    <div className="navbar__inner">
      <div
        className={clsx(
          ThemeClassNames.layout.navbar.containerLeft,
          'navbar__items',
        )}>
        {left}
      </div>
      <div
        className={clsx(
          ThemeClassNames.layout.navbar.containerRight,
          'navbar__items navbar__items--right',
        )}>
        {right}
      </div>
    </div>
  );
}
export default function NavbarContent() {
  const mobileSidebar = useNavbarMobileSidebar();
  const navbarStyle = useThemeConfig().navbar.style;
  const items = useNavbarItems();
  const [leftItems, rightItems] = splitNavbarItems(items);
  const searchBarItem = items.find((item) => item.type === 'search');
  
  const {
    isProcessing,
    galleryVisible,
    setGalleryVisible,
    photos,
    handleCameraClick,
    loadPhotosFromAPI
  } = useCamera();

  return (
    <>
      <NavbarContentLayout
        left={
          // TODO stop hardcoding items?
          <>
            {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
            <NavbarLogo />
            <NavbarItems items={leftItems} />
          </>
        }
        right={
          // TODO stop hardcoding items?
          // Ask the user to add the respective navbar items => more flexible
            <>
                <button
                    className={clsx(
                        styles.cameraButton,
                        styles.hidden,
                        navbarStyle === 'dark' ? styles.darkNavbarColorModeToggle : undefined,
                        isProcessing && styles.processing
                    )}
                    onClick={() => {
                      if (!galleryVisible) {
                        loadPhotosFromAPI();
                        setGalleryVisible(true);
                      } else {
                        setGalleryVisible(false);
                      }
                    }}>
                    👀
                </button>
                <button 
                  id="cameraBtn" 
                  className={clsx(
                    styles.cameraButton,
                    navbarStyle === 'dark' ? styles.darkNavbarColorModeToggle : undefined,
                    isProcessing && styles.processing
                  )}
                  onClick={handleCameraClick}
                  disabled={isProcessing}
                >
                    {isProcessing ? 'FUCK YOU!' : '📷'}
                </button>
                <NavbarItems items={rightItems}/>
                <NavbarColorModeToggle className={styles.colorModeToggle}/>
                {!searchBarItem && (
                    <NavbarSearch>
                        <SearchBar/>
                    </NavbarSearch>
                )}
            </>
        }
      />
      
      <CameraGallery 
        visible={galleryVisible}
        onClose={() => setGalleryVisible(false)}
        photos={photos}
      />
    </>
  );
}
