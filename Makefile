clean:
	rm -rf public

dependencies:
	(cd themes/falco-fresh && npm install)

serve: dependencies
	hugo server \
		--buildDrafts \
		--buildFuture

production-build: dependencies
	hugo --minify
	make check-links

preview-build: dependencies
	hugo \
		--baseURL $(DEPLOY_PRIME_URL) \
		--buildDrafts \
		--buildFuture \
		--minify
	make check-links

link-checker-setup:
	curl https://raw.githubusercontent.com/wjdp/htmltest/master/godownloader.sh | bash

run-link-checker:
	bin/htmltest

check-links: link-checker-setup run-link-checker

check-links-locally: clean production-build check-links
