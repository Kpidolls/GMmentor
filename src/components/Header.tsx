import React, { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-scroll';
import { useRouter } from 'next/router';
import config from '../config/index.json';

const Menu = () => {
  const { navigation, company } = config;
  const { name: companyName, logo } = company;
  const router = useRouter();

  const handleNavigation = (href: string) => {
    router.push(`/#${href}`);
  };

  return (
    <>
      <svg
        className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-background transform translate-x-1/2"
        fill="currentColor"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polygon points="50,0 100,0 50,100 0,100" />
      </svg>
      <Popover>
        <div className="relative pt-6 px-4 sm:px-6 lg:px-8">
          <nav className="relative flex items-center justify-between sm:h-10 lg:justify-start" aria-label="Global">
            <div className="flex items-center flex-grow flex-shrink-0 lg:flex-grow-0">
              <div className="flex items-center justify-between w-full md:w-auto">
                <a href="#">
                  <span className="sr-only">{companyName}</span>
                  <img alt="logo" className="h-16 w-auto sm:h-16" src={logo} />
                </a>
                <div className="-mr-2 flex items-center md:hidden">
                  <Popover.Button
                    className="bg-background rounded-md p-2 inline-flex items-center justify-center font-secondary text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary"
                  >
                    <span className="sr-only">Open main menu</span>
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                  </Popover.Button>
                </div>
              </div>
            </div>
            <div className="hidden md:flex md:ml-10 md:pr-4 md:space-x-8">
              {navigation.map((item) =>
                item.submenu ? (
                  <Popover key={item.name} className="relative">
                    {({ open }) => (
                      <>
                        <Popover.Button
                          className={`group inline-flex items-center font-primary text-gray-500 hover:text-gray-900 font-medium focus:outline-none ${
                            open ? 'text-gray-900' : ''
                          }`}
                        >
                          <span>{item.name}</span>
                          <ChevronDownIcon
                            className={`ml-2 h-5 w-5 text-gray-400 font-secondary group-hover:text-gray-500 ${
                              open ? 'text-gray-500' : ''
                            }`}
                            aria-hidden="true"
                          />
                        </Popover.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="opacity-0 translate-y-1"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition ease-in duration-150"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 translate-y-1"
                        >
                          <Popover.Panel className="absolute z-10 mt-3 transform px-2 w-auto max-w-md sm:px-0">
                            <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                              <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8 min-w-max">
                                {item.submenu.map((subItem) => (
                                  <Link
                                    key={subItem.name}
                                    to={subItem.href}
                                    spy={true}
                                    smooth={true}
                                    duration={1000}
                                    className="block px-3 py-2 rounded-md text-base font-medium font-primary text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleNavigation(subItem.href)}
                                  >
                                    {subItem.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </Popover.Panel>
                        </Transition>
                      </>
                    )}
                  </Popover>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    spy={true}
                    smooth={true}
                    duration={1000}
                    className="font-medium text-gray-500 font-secondary hover:text-gray-900 cursor-pointer"
                    onClick={() => handleNavigation(item.href)}
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>
          </nav>
        </div>
        <Transition
          as={Fragment}
          enter="duration-200 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-150 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Popover.Panel
            focus
            className="absolute z-20 top-0 inset-x-0 p-4 transition transform origin-top-right md:hidden"
          >
            <div className="rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
              {/* Header Section */}
              <div className="px-5 pt-4 flex items-center justify-between">
                <div>
                  <img className="h-10 w-auto" src={logo} alt={companyName} />
                </div>
                <div className="-mr-2">
                  <Popover.Button
                    className="bg-gray-100 rounded-md p-2 inline-flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  >
                    <span className="sr-only">Close main menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </Popover.Button>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="px-4 pt-4 pb-6 space-y-4">
                {navigation.map((item) =>
                  item.submenu ? (
                    <div key={item.name} className="space-y-2">
                      <span className="block text-lg font-semibold text-gray-700">
                        {item.name}
                      </span>
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          spy={true}
                          smooth={true}
                          duration={1000}
                          className="block px-4 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleNavigation(subItem.href)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      spy={true}
                      smooth={true}
                      duration={1000}
                      className="block px-4 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleNavigation(item.href)}
                    >
                      {item.name}
                    </Link>
                  )
                )}
              </div>
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    </>
  );
};

export default Menu;