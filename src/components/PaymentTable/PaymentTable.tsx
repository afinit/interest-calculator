import React from 'react';

import { LoanState, CalculatorState } from '../../containers/Calculator/Calculator';

interface LoanTrack {
    principal: number;
    interestRate: number;
    loanLength: number;
    loanMonthlyPayment: number;
    interestPayment: number;
    principalPayment: number;
    totalPayment: number;
    [key: string]: number;
}

const calculatePayment = (totalPayment: number, principal: number, interestPayment: number) => {
    let payment = totalPayment - interestPayment;
    let addtlLeft = totalPayment;

    if (principal - payment < 0.005) {
        payment = principal;
        addtlLeft -= payment + interestPayment;
    }
    else {
        addtlLeft = 0;
    }

    return {payment, addtlLeft}
}

const reduceLoanState = (acc: {loans: Array<LoanState>, additionalPayment: number}, loan: LoanTrack) => {
    let additionalPayment = acc.additionalPayment + loan.loanMonthlyPayment;
    if (loan.principal > 0) {
        loan.interestPayment = loan.interestRate * loan.principal / 12.0;
        const paymentInfo = calculatePayment(additionalPayment, loan.principal, loan.interestPayment);
        loan.principalPayment = paymentInfo.payment;
        additionalPayment = paymentInfo.addtlLeft;

        loan.principal -= loan.principalPayment;
        loan.totalPayment = loan.principalPayment + loan.interestPayment;
        console.log(
            "interest: ", loan.interestPayment, 
            " principal: ", loan.principal, 
            " principalPayment: ", loan.principalPayment, 
            " payment: ", additionalPayment);
    }
    else {
        loan.interestPayment = 0;
        loan.principalPayment = 0;
        loan.totalPayment = 0;
    }
    return { loans: [...acc.loans, { ...loan }], additionalPayment: additionalPayment };
}

const paymentTable = (props: CalculatorState) => {
    const loansCopy: Array<LoanState> = JSON.parse(JSON.stringify(props.loans));
    const loans = loansCopy.map((loan: LoanState) => {
        return { ...loan, interestPayment: 0, principalPayment: 0, totalPayment: 0 }
    });
    // const interestRates = props.loans.map(loan => loan.interestRate);
    // const loanIdxSorted = interestRates.map((rate, idx) => [rate, idx])
    //     .sort((a,b) => a[0] - b[0])
    //     .map(x => x[1]);

    var monthlyUpdates = [];

    // var totalPrincipal = loans.map(loan => loan.principal).reduce((acc, elem) => acc + elem);
    const longestLoan = Math.max(...loans.map(loan => loan.loanLength))
    console.log("longestLoan: ", longestLoan);

    for (var i = 0; i < longestLoan; i++) {
        // TODO:: Remove side-effects from this process.. currently we are modifying loans on every iteration of this
        monthlyUpdates.push(loans.reduce( reduceLoanState, {loans: [], additionalPayment: props.additionalPayment}).loans);
        // totalPrincipal = loans.map(loan => loan.principal).reduce((acc, elem) => acc + elem);
    }

    console.log(monthlyUpdates);
    return (
        <div>
            <p>Total Loan Cost: {
                monthlyUpdates.flatMap(month => month.map(loan => loan.totalPayment))
                    .reduce((a,b) => a + b).toFixed(2)
            }</p>
            <table>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Principal</th>
                        <th>Interest Payment</th>
                        <th>Principal Payment</th>
                        <th>Total Payment</th>
                    </tr>
                </thead>
                <tbody>
                    {monthlyUpdates.map((month, idx) =>
                        <tr key={idx}>
                            <td>{idx}</td>
                            <td>{month.map(loan => loan.principal).reduce((a, b) => a + b).toFixed(2)}</td>
                            <td>{month.map(loan => loan.interestPayment).reduce((a, b) => a + b).toFixed(2)}</td>
                            <td>{month.map(loan => loan.principalPayment).reduce((a, b) => a + b).toFixed(2)}</td>
                            <td>{month.map(loan => loan.totalPayment).reduce((a, b) => a + b).toFixed(2)}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default paymentTable;