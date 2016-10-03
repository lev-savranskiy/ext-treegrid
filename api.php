<?php
header('Content-Type: text/xml');
print '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';


if ($_REQUEST['action'] == 'create') {
    print '<segment name="test2" id="' . time() . '"/>';
}

if ($_REQUEST['action'] == 'edit') {

}
if ($_REQUEST['action'] == 'archive') {

}

if ($_REQUEST['action'] == 'usage') {
    print '
<dataCampaigns><dataCampaign status="Active" name="campaign 1" id="24270720">
        <audienceGroups>
            <audienceGroup name="favonnon.com" id="8903"/>
        </audienceGroups>
        <remainingBudget>0.0</remainingBudget>
        <segment status="In-Flight" name="ra test" id="10079424"/>
        <totalBudget>0.0</totalBudget>
    </dataCampaign>
     <dataCampaign status="Active" name="campaign 2" id="24270720">
        <audienceGroups>
            <audienceGroup name="favonnon.com" id="8903"/>
        </audienceGroups>
        <remainingBudget>0.0</remainingBudget>
        <segment status="In-Flight" name="ra test" id="10079424"/>
        <totalBudget>0.0</totalBudget>
    </dataCampaign>
</dataCampaigns>';
}