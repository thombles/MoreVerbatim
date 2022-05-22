## Update 23 May 2022

This was a useful little tool but I no longer use Firefox and Google together and I have received a report that Google's own "Verbatim" mode is working. I'm not going to be maintaining this going forward. Please go ahead and use it locally and/or fork as required.

# MoreVerbatim

Firefox addon for verbatim Google search that's more verbatim than "verbatim" mode.

If you include "v" as a Google search term it will add double quotes to all your terms (and remove the "v"). This is useful to prevent Google from assuming that one of the search terms is superfluous and ignoring it.

Install the addon from the Mozilla site: https://addons.mozilla.org/en-US/firefox/addon/moreverbatim/

Pull requests welcome.

## Example

If you type: `v uiwebview "set scroll position" ios`

You will actually search for: `"uiwebview" "set scroll position" "ios"`
