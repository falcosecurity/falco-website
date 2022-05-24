clean:
	rm -rf public

dependencies:
	npm install && git submodule update -f --init --recursive

serve: dependencies
	hugo server --minify \
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
#	bin/htmltest
	echo "todo: re-enable link checker"

check-links: link-checker-setup run-link-checker

check-links-locally: check-links
