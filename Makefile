#!/usr/bin/make -f

ZIP0=7z a -tzip -mx=0 -r
ZIP9=7z a -tzip -mx=9 -r
RM_RF=rm -rf

BASEDIR=$(PWD)
BUILDDIR=$(BASEDIR)/build

target=$(notdir $(PWD))
xpifile=$(BASEDIR)/$(target).xpi
jarfile=$(BUILDDIR)/chrome/$(target).jar
installfiles=$(filter-out chrome build %.xpi,$(wildcard *))

.PHONY: all clean clean_builddirs

all: $(xpifile)

$(xpifile): $(jarfile) $(installfiles)
	cp -r $(installfiles) $(BUILDDIR)
	cd $(BUILDDIR) \
		&& $(ZIP9) tmp.xpi * \
		&& mv tmp.xpi $(xpifile)

$(jarfile): $(BUILDDIR) chrome
	cd chrome \
		&& $(ZIP0) tmp.jar * \
		&& mv tmp.jar $(jarfile)

$(BUILDDIR):
	mkdir -p $(BUILDDIR)/chrome

clean: clean_builddirs
	$(RM_RF) $(xpifile)

clean_builddirs:
	$(RM_RF) $(BUILDDIR)
