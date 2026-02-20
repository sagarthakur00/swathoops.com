import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <span className="text-2xl font-bold tracking-wider">
              <span className="text-amber-500">SWAT</span>
              <span className="text-white">HOOPS</span>
            </span>
            <p className="mt-4 text-sm text-neutral-500 leading-relaxed">
              Premium men&apos;s footwear crafted for the modern gentleman.
              Quality materials, timeless design.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/shop", label: "Shop All" },
                { href: "/shop?category=Loafers", label: "Loafers" },
                { href: "/shop?category=Casual", label: "Casual" },
                { href: "/shop?category=Formal", label: "Formal" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "#", label: "Shipping Policy" },
                { href: "#", label: "Returns" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-4">
              Stay Updated
            </h3>
            <p className="text-sm text-neutral-500 mb-4">
              Subscribe for new arrivals and exclusive offers.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-white/5 border border-white/10 rounded-l-lg px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              <button className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-r-lg transition-colors">
                →
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-600">
            © 2026 SWATHOOPS. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Instagram", "Twitter", "Facebook"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-xs text-neutral-600 hover:text-white transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
