import React from "react";
import Container from "../ui/Container";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { ModeToggle } from "../ui/ModeToggle";

type Props = {};

const Navbar = (props: Props) => {
  return (
    <nav className="w-full py-8 bg-foundation-alternate sticky top-0 z-50 backdrop-blur-sm transition-all duration-300">
      <Container className="flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/pixsee_logo_black.png"
            alt="Pixsee"
            width={120}
            height={40}
            className="h-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-full bg-transparent px-6 py-5 flex items-center gap-2 border-gray-500 hover:border-gray-400 shadow-lg"
            asChild
          >
            <Link href="/contact">
              Contact us
              <span className="text-lg">→</span>
            </Link>
          </Button>

          {/* <ModeToggle /> */}
        </div>
      </Container>
    </nav>
  );
};

export default Navbar;
