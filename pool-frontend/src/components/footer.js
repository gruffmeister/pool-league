'use client';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground text-center py-4 text-sm">
      &copy; {new Date().getFullYear()} Pool League. All rights reserved.
    </footer>
  );
}
