# Third-Party Licenses

This project uses open-source software from third parties. Below is a summary of the licenses used by our dependencies.

## License Summary

This software includes dependencies under the following licenses:

- **MIT License** (675 packages) - Permissive license allowing commercial use
- **Apache License 2.0** (30 packages) - Permissive license with patent grant
- **ISC License** (34 packages) - Functionally equivalent to MIT
- **BSD Licenses** (25 packages) - Permissive licenses
- **Mozilla Public License 2.0** (2 packages) - File-level copyleft
- **LGPL 3.0** (1 package) - Library-level copyleft
- **Public Domain / CC0 / Unlicense** - Public domain dedications

## Major Dependencies

### Frontend (Player & Admin Apps)
- **React** (MIT) - UI library
- **Material-UI** (MIT) - React component library
- **TanStack Router** (MIT) - Type-safe routing
- **TanStack Query** (MIT) - Data fetching and caching
- **Tailwind CSS** (MIT) - Utility-first CSS framework
- **Vite** (MIT) - Build tool
- **TypeScript** (Apache 2.0) - Type-safe JavaScript

### Backend (API)
- **Express** (MIT) - Web framework
- **PostgreSQL** (PostgreSQL License - BSD-style) - Database client
- **Zod** (MIT) - Schema validation
- **Node.js** (MIT) - Runtime environment

## License Compliance

### Permissive Licenses (MIT, Apache, ISC, BSD)
These licenses allow you to:
- Use the software commercially
- Modify the software
- Distribute the software
- Sublicense the software

Requirements:
- Include copyright notices
- Include license text (for Apache 2.0, include NOTICE file if present)

### Copyleft Licenses (MPL, LGPL)
**Mozilla Public License 2.0** (2 packages):
- Modifications to MPL-licensed files must be released under MPL
- Your proprietary code can remain proprietary
- Must disclose source of modified MPL files

**LGPL 3.0** (1 package):
- Can be used in proprietary software
- Modifications to the LGPL library itself must be released
- Must allow users to replace the LGPL library

## Attribution

This software includes code from the following projects:

### React
Copyright (c) Meta Platforms, Inc. and affiliates.
Licensed under the MIT License.

### Material-UI
Copyright (c) 2014 Call-Em-All
Licensed under the MIT License.

### Vite
Copyright (c) 2019-present, Yuxi (Evan) You and Vite contributors
Licensed under the MIT License.

### TypeScript
Copyright (c) Microsoft Corporation.
Licensed under the Apache License 2.0.

## Full License Texts

### MIT License
```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Apache License 2.0
```
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

### ISC License
```
Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

## Detailed Dependency List

For a complete list of all dependencies and their licenses, you can run:
```bash
npx license-checker --summary
```

Or view individual package licenses in the `node_modules` directory.

## Notes

- This list is automatically generated and may not be exhaustive
- Licenses are subject to change with dependency updates
- For the most current license information, check the individual package repositories
- Users of this software must also comply with all third-party license terms

Last updated: 2025-11-29
