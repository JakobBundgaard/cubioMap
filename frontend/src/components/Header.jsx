function Header() {
    return (
      <header className="bg-gray-800 text-white p-4 flex items-center justify-between">
        {/* Logo og titel */}
        <div className="flex items-center">
          {/* <img src="/path/to/logo.png" alt="Logo" className="h-8 w-8 mr-3" /> */}
          <h1 className="text-xl font-semibold">Cubio Map</h1>
        </div>
      </header>
    );
  }
  
  export default Header;
  