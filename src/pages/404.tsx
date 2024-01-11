export default function Custom404() {
  return (
    <div className="@h-full @w-full @flex @items-center @align-middle @justify-center @bg-black/60 @space-x-6 smallscreen:@space-x-12">
      <svg className="@fill-primary" xmlns="http://www.w3.org/2000/svg" height="200" viewBox="0 -960 960 960" width="200">
        <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z"/>
      </svg>
      <h1 className="@text-4xl smallscreen:@text-6xl">404 - Page Not Found</h1>
    </div>
  );
}