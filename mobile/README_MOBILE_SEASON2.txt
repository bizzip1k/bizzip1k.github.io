BIZZIP Mobile Season 2

기준 PC 버전
- Frozen branch: pc-frozen-2026-10-04
- Base commit: 1da6b8d1fbafac412c921360d3f4b5ebd3aae873

운영 원칙
1. 기존 PC 운영 파일(index.html, style.css, admin.html, admin.js 등)은 모바일 개발 중 수정하지 않는다.
2. 모바일 화면은 mobile/ 폴더 안의 독립 HTML/CSS/JS로 개발한다.
3. 기존 root의 mobile.css, mobile.js, mobile-assets는 과거 작업물로 간주하며 새 시즌2에서 직접 사용하지 않는다.
4. 모바일과 PC 간 이동 링크만 허용하고, 스타일시트/스크립트는 공유하지 않는다.
5. 콘텐츠 데이터 연동이 필요할 경우 읽기 전용 방식부터 검토한다.
6. 모바일 완성 후 검증된 파일만 main에 선택적으로 반영한다.

작업 브랜치
- mobile-season2
